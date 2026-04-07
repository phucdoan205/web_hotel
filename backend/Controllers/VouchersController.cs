using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VouchersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VouchersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetVouchers()
        {
            var vouchers = await _context.Vouchers.Include(v => v.User).ToListAsync();
            return Ok(vouchers);
        }

        public class CreateVoucherDto : Voucher
        {
            public bool SendEmail { get; set; }
            public string? CustomerEmail { get; set; }
            public string? TargetAudience { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> CreateVoucher([FromBody] CreateVoucherDto dto, [FromServices] backend.Services.IEmailService emailService)
        {
            var targetUsers = new List<User>();

            if (dto.TargetAudience == "SpecificUser" || string.IsNullOrEmpty(dto.TargetAudience))
            {
                if (dto.UserId.HasValue)
                {
                    var user = await _context.Users.FindAsync(dto.UserId.Value);
                    if (user != null) targetUsers.Add(user);
                }
            }
            else if (dto.TargetAudience == "Staff")
            {
                targetUsers = await _context.Users.Where(u => u.RoleId == 2).ToListAsync(); // RoleId = 2 (Staff)
            }
            else if (dto.TargetAudience == "LoyalCustomer")
            {
                targetUsers = await _context.Users.Where(u => u.MembershipId > 1).ToListAsync(); // MembershipId > 1 (VIP)
            }
            else if (dto.TargetAudience == "BirthdayMonth")
            {
                int currentMonth = DateTime.Now.Month;
                targetUsers = await _context.Users.Where(u => u.DateOfBirth.HasValue && u.DateOfBirth.Value.Month == currentMonth).ToListAsync();
            }
            else if (dto.TargetAudience == "NewRegistration")
            {
                var oneWeekAgo = DateTime.UtcNow.AddDays(-7);
                targetUsers = await _context.Users.Where(u => u.CreatedAt >= oneWeekAgo).ToListAsync();
            }
            else if (dto.TargetAudience == "All") 
            {
                targetUsers = await _context.Users.ToListAsync();
            }

            // Nếu không có TargetAudience và không có targetUser nào (hoặc UserId = null chung cho tất cả)
            if (targetUsers.Count == 0 && string.IsNullOrEmpty(dto.TargetAudience))
            {
                var voucher = new Voucher
                {
                    Code = dto.Code,
                    DiscountType = dto.DiscountType,
                    DiscountValue = dto.DiscountValue,
                    MinBookingValue = dto.MinBookingValue,
                    ValidFrom = dto.ValidFrom,
                    ValidTo = dto.ValidTo,
                    UsageLimit = dto.UsageLimit,
                    UsageCount = 0,
                    IsActive = dto.IsActive,
                    UserId = null
                };
                _context.Vouchers.Add(voucher);
                await _context.SaveChangesAsync();
                return Ok(voucher);
            }

            var createdVouchers = new List<Voucher>();

            foreach (var user in targetUsers)
            {
                string uniqueCode = dto.Code;
                // Auto generate unique code if it's a bulk operation
                if (targetUsers.Count > 1 || dto.TargetAudience == "BirthdayMonth" || dto.TargetAudience == "NewRegistration" || dto.TargetAudience == "Staff" || dto.TargetAudience == "LoyalCustomer")
                {
                    string prefix = dto.TargetAudience == "BirthdayMonth" ? "HPBD-" : (dto.TargetAudience == "NewRegistration" ? "WELCOME-" : "VOUCHER-");
                    uniqueCode = prefix + Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();
                    // Keep original code if they provided one specifically, but usually for bulk we'd want unique.
                    // We'll enforce unique here.
                }

                var voucher = new Voucher
                {
                    Code = uniqueCode,
                    DiscountType = dto.DiscountType,
                    DiscountValue = dto.DiscountValue,
                    MinBookingValue = dto.MinBookingValue,
                    ValidFrom = dto.ValidFrom,
                    ValidTo = dto.ValidTo,
                    UsageLimit = dto.UsageLimit,
                    UsageCount = 0,
                    IsActive = dto.IsActive,
                    UserId = user.Id
                };

                _context.Vouchers.Add(voucher);
                createdVouchers.Add(voucher);

                if (dto.SendEmail && !string.IsNullOrEmpty(user.Email))
                {
                    string title = dto.TargetAudience == "BirthdayMonth" ? "Chúc Mừng Sinh Nhật" : 
                                   (dto.TargetAudience == "NewRegistration" ? "Chào Mừng Thành Viên Mới" : "Quà Tặng Từ Khách Sạn");
                    await emailService.SendVoucherEmailAsync(user.Email, uniqueCode, voucher.DiscountValue, title);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(createdVouchers);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVoucher(int id, [FromBody] Voucher update)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null) return NotFound();

            voucher.Code = update.Code;
            voucher.DiscountType = update.DiscountType;
            voucher.DiscountValue = update.DiscountValue;
            voucher.MinBookingValue = update.MinBookingValue;
            voucher.ValidFrom = update.ValidFrom;
            voucher.ValidTo = update.ValidTo;
            voucher.UsageLimit = update.UsageLimit;
            voucher.IsActive = update.IsActive;

            await _context.SaveChangesAsync();
            return Ok(voucher);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVoucher(int id)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null) return NotFound();
            _context.Vouchers.Remove(voucher);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
