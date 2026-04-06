using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReceptionistController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReceptionistController(AppDbContext context)
        {
            _context = context;
        }

        public class WalkInRegisterDto
        {
            public string FullName { get; set; } = null!;
            public string Email { get; set; } = null!;
            public string Phone { get; set; } = null!;
            public DateTime? DateOfBirth { get; set; }
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterWalkin([FromBody] WalkInRegisterDto dto)
        {
            var customerRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Customer");
            var roleId = customerRole?.Id;

            // Kiểm tra email trùng
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest("Email đã tồn tại.");
            }

            var newUser = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone,
                DateOfBirth = dto.DateOfBirth,
                PasswordHash = "WalkInPass@123", // Default password
                RoleId = roleId,
                Status = true,
                TotalSpending = 0
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Khách hàng đã được đăng ký thành viên.", user = newUser });
        }

        public class CheckVoucherDto 
        {
            public string Code { get; set; } = null!;
            public int? UserId { get; set; } // Người đang book phòng
        }

        [HttpPost("check-voucher")]
        public async Task<IActionResult> CheckVoucher([FromBody] CheckVoucherDto dto)
        {
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Code == dto.Code);

            if (voucher == null) return NotFound("Voucher không tồn tại.");
            if (!voucher.IsActive) return BadRequest("Voucher đã bị vô hiệu hóa.");
            
            if (voucher.ValidFrom.HasValue && voucher.ValidFrom.Value > DateTime.Today) return BadRequest("Voucher chưa đến ngày sử dụng.");
            if (voucher.ValidTo.HasValue && voucher.ValidTo.Value < DateTime.Today) return BadRequest("Voucher đã hết hạn.");

            if (voucher.UsageLimit.HasValue && voucher.UsageCount >= voucher.UsageLimit.Value) 
                return BadRequest("Voucher đã hết lượt sử dụng.");

            if (voucher.UserId.HasValue && voucher.UserId.Value != dto.UserId)
                return BadRequest("Voucher này không dành cho khách hàng này (voucher ưu đãi riêng).");

            return Ok(new {
                message = "Voucher hợp lệ",
                discountType = voucher.DiscountType,
                discountValue = voucher.DiscountValue,
                voucherId = voucher.Id
            });
        }

        public class ApplyVoucherDto
        {
            public int VoucherId { get; set; }
            public int? UserId { get; set; } // Nếu có user
            public decimal OrderValue { get; set; } // Giá trị hóa đơn để cộng vào chi tiêu
        }

        [HttpPost("apply-voucher")]
        public async Task<IActionResult> ApplyVoucher([FromBody] ApplyVoucherDto dto)
        {
            // 1. Dùng Voucher
            var voucher = await _context.Vouchers.FindAsync(dto.VoucherId);
            if (voucher == null) return NotFound();

            if (voucher.UsageLimit.HasValue && voucher.UsageCount >= voucher.UsageLimit.Value)
                return BadRequest("Voucher đã hết lượt sử dụng.");

            voucher.UsageCount++;

            // 2. Tích luỹ chi tiêu
            if (dto.UserId.HasValue)
            {
                var user = await _context.Users.FindAsync(dto.UserId.Value);
                if (user != null)
                {
                    user.TotalSpending += dto.OrderValue;

                    // 3. Cập nhật hạng thành viên tự động
                    // Giả sử Memberships.MinPoints lưu giữ ngưỡng chi tiêu
                    var newTier = await _context.Memberships
                        .Where(m => m.MinPoints <= user.TotalSpending)
                        .OrderByDescending(m => m.MinPoints)
                        .FirstOrDefaultAsync();

                    if (newTier != null)
                    {
                        user.MembershipId = newTier.Id;
                    }
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Sử dụng voucher và tích điểm thành công." });
        }
    }
}
