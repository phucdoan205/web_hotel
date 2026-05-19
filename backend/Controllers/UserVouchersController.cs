using backend.Data;
using backend.DTOs;
using backend.DTOs.Voucher;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserVouchersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserVouchersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<UserVoucherDTO>>> GetMyVouchers()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            var userVouchers = await _context.UserVouchers
                .Include(uv => uv.Voucher)
                .Where(uv => uv.UserId == userId 
                    && !uv.IsUsed 
                    && (!uv.Voucher.ValidTo.HasValue || uv.Voucher.ValidTo.Value >= DateTime.UtcNow)
                    && (!uv.Voucher.UsageLimit.HasValue || uv.Voucher.UsageCount < uv.Voucher.UsageLimit.Value))
                .OrderByDescending(uv => uv.SavedAt)
                .Select(uv => new UserVoucherDTO
                {
                    Id = uv.Id,
                    UserId = uv.UserId,
                    VoucherId = uv.VoucherId,
                    SavedAt = uv.SavedAt,
                    IsUsed = uv.IsUsed,
                    Voucher = new VoucherDTO
                    {
                        Id = uv.Voucher.Id,
                        Code = uv.Voucher.Code,
                        Name = uv.Voucher.Name,
                        DiscountType = uv.Voucher.DiscountType,
                        DiscountValue = uv.Voucher.DiscountValue,
                        MinBookingValue = uv.Voucher.MinBookingValue,
                        ValidFrom = uv.Voucher.ValidFrom,
                        ValidTo = uv.Voucher.ValidTo,
                        Description = uv.Voucher.Description,
                        IsActive = uv.Voucher.IsActive,
                        VoucherType = uv.Voucher.VoucherType,
                        TargetUserId = uv.Voucher.TargetUserId
                    }
                })
                .ToListAsync();

            return Ok(userVouchers);
        }

        [HttpPost("save/{voucherId}")]
        public async Task<IActionResult> SaveVoucher(int voucherId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            var voucher = await _context.Vouchers.FindAsync(voucherId);
            if (voucher == null) return NotFound(new { message = "Voucher không tồn tại" });

            if (voucher.TargetUserId.HasValue && voucher.TargetUserId.Value != userId)
            {
                return BadRequest(new { message = "Voucher này không dành cho bạn!" });
            }

            var existing = await _context.UserVouchers
                .FirstOrDefaultAsync(uv => uv.UserId == userId && uv.VoucherId == voucherId);
            
            if (existing != null) return BadRequest(new { message = "Voucher này đã được lưu trước đó" });

            var userVoucher = new UserVoucher
            {
                UserId = userId,
                VoucherId = voucherId,
                SavedAt = DateTime.UtcNow
            };

            _context.UserVouchers.Add(userVoucher);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã lưu voucher thành công" });
        }
    }
}
