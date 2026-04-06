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
        }

        [HttpPost]
        public async Task<IActionResult> CreateVoucher([FromBody] CreateVoucherDto dto, [FromServices] backend.Services.IEmailService emailService)
        {
            // Map DTO to Voucher
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
                UserId = dto.UserId
            };

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();

            if (dto.SendEmail && !string.IsNullOrEmpty(dto.CustomerEmail))
            {
                await emailService.SendBirthdayVoucherEmailAsync(dto.CustomerEmail, voucher.Code, voucher.DiscountValue);
            }

            return Ok(voucher);
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
