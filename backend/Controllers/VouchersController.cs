using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VouchersController : ControllerBase
    {
            private readonly AppDbContext _context;
            private readonly NotificationService _notificationService;
            private readonly IEmailService _emailService;
            private readonly ILogger<VouchersController> _logger;

            public VouchersController(AppDbContext context, NotificationService notificationService, IEmailService emailService, ILogger<VouchersController> logger)
            {
                _context = context;
                _notificationService = notificationService;
                _emailService = emailService;
                _logger = logger;
            }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] bool includeDeleted = false)
        {
            var query = _context.Vouchers.AsQueryable();
            if (!includeDeleted)
            {
                query = query.Where(v => !v.IsDeleted);
            }

            var list = await query
                .Select(v => new VoucherDTO
                {
                    Id = v.Id,
                    Code = v.Code,
                    DiscountType = v.DiscountType,
                    DiscountValue = v.DiscountValue,
                    MinBookingValue = v.MinBookingValue,
                    ValidFrom = v.ValidFrom,
                    ValidTo = v.ValidTo,
                    UsageLimit = v.UsageLimit,
                    UsageCount = v.UsageCount,
                    IsPrivate = v.IsPrivate,
                    IsDeleted = v.IsDeleted,
                    DeletedAt = v.DeletedAt
                })
                .AsNoTracking()
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOne(int id, [FromQuery] bool includeDeleted = false)
        {
            var v = await _context.Vouchers.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && (includeDeleted || !x.IsDeleted));
            if (v == null) return NotFound();
            var dto = new VoucherDTO
            {
                Id = v.Id,
                Code = v.Code,
                DiscountType = v.DiscountType,
                DiscountValue = v.DiscountValue,
                MinBookingValue = v.MinBookingValue,
                ValidFrom = v.ValidFrom,
                ValidTo = v.ValidTo,
                UsageLimit = v.UsageLimit,
                UsageCount = v.UsageCount,
                IsPrivate = v.IsPrivate,
                IsDeleted = v.IsDeleted,
                DeletedAt = v.DeletedAt
            };
            return Ok(dto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] VoucherDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Code)) return BadRequest("Code is required");

            var v = new Voucher
            {
                Code = dto.Code.Trim(),
                DiscountType = dto.DiscountType?.Trim() ?? "PERCENT",
                DiscountValue = dto.DiscountValue,
                MinBookingValue = dto.MinBookingValue,
                ValidFrom = dto.ValidFrom,
                ValidTo = dto.ValidTo,
                UsageLimit = dto.UsageLimit,
                UsageCount = dto.UsageCount,
                IsPrivate = dto.IsPrivate,
                IsDeleted = false,
                DeletedAt = null
            };

            _context.Vouchers.Add(v);
            await _context.SaveChangesAsync();

            dto.Id = v.Id;
            return Ok(dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] VoucherDTO dto)
        {
            var v = await _context.Vouchers.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
            if (v == null) return NotFound();

            v.Code = dto.Code ?? v.Code;
            v.DiscountType = dto.DiscountType ?? v.DiscountType;
            v.DiscountValue = dto.DiscountValue;
            v.MinBookingValue = dto.MinBookingValue;
            v.ValidFrom = dto.ValidFrom;
            v.ValidTo = dto.ValidTo;
            v.UsageLimit = dto.UsageLimit;
            v.IsPrivate = dto.IsPrivate;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            var v = await _context.Vouchers.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
            if (v == null) return NotFound();
            v.IsDeleted = true;
            v.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        public class SendToUsersRequest
        {
            public int VoucherId { get; set; }
            public List<string>? Recipients { get; set; }
            public string? Message { get; set; }
        }

        [HttpPost("send/users")]
        public async Task<IActionResult> SendToUsers([FromBody] SendToUsersRequest request)
        {
            var v = await _context.Vouchers.FirstOrDefaultAsync(x => x.Id == request.VoucherId && !x.IsDeleted);
            if (v == null) return NotFound();

            var recipients = request.Recipients ?? new List<string>();
            // mark voucher as private when sending to specific emails
            if (recipients.Count > 0)
            {
                v.IsPrivate = true;
                await _context.SaveChangesAsync();
            }

            var sent = 0;
            var failed = new List<string>();
            foreach (var email in recipients)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                var title = $"Bạn nhận được voucher {v.Code}";
                var contentText = $"Mã: {v.Code}\nGiảm: {v.DiscountValue} ({v.DiscountType})\nHạn: {v.ValidFrom?.ToShortDateString()} - {v.ValidTo?.ToShortDateString()}";
                if (!string.IsNullOrWhiteSpace(request.Message))
                {
                    contentText = request.Message + "\n\n" + contentText;
                }

                // create app notification
                await _notificationService.CreateAsync(title, contentText, "Voucher", null, user?.Id);

                // send email if possible
                try
                {
                    var html = $"<div style=\"text-align:center;font-family:Arial,sans-serif\"><h1 style=\"color:#0085FF\">{v.Code}</h1><p>{title}</p><p>{contentText.Replace("\n","<br/>")}</p></div>";
                    await _emailService.SendEmailAsync(email, title, html);
                    sent++;
                }
                catch (System.Exception ex)
                {
                    failed.Add(email);
                    _logger?.LogError(ex, "Failed to send voucher {VoucherId} to {Email}", v.Id, email);
                }
            }

            return Ok(new { sent = sent, failed = failed });
        }

        public class SendToBirthdaysRequest
        {
            public int VoucherId { get; set; }
            public DateTime? Date { get; set; }
            public string? Message { get; set; }
        }

        [HttpPost("send/birthdays")]
        public async Task<IActionResult> SendToBirthdays([FromBody] SendToBirthdaysRequest request)
        {
            var v = await _context.Vouchers.FirstOrDefaultAsync(x => x.Id == request.VoucherId && !x.IsDeleted);
            if (v == null) return NotFound();

            var targetDate = request.Date?.Date ?? DateTime.Today;
            var users = await _context.Users.Where(u => u.DateOfBirth.HasValue && u.DateOfBirth.Value.Day == targetDate.Day && u.DateOfBirth.Value.Month == targetDate.Month).ToListAsync();
            var sent = 0;
            var failed = new List<string>();
            foreach (var user in users)
            {
                var title = $"Chúc mừng sinh nhật - {v.Code}";
                var content = $"Chúc mừng sinh nhật {user.FullName}! Tặng bạn mã {v.Code} - Giảm {v.DiscountValue} ({v.DiscountType}). Hạn dùng: {v.ValidFrom?.ToShortDateString()} - {v.ValidTo?.ToShortDateString()}";
                if (!string.IsNullOrWhiteSpace(request.Message))
                {
                    content = request.Message + "\n\n" + content;
                }
                await _notificationService.CreateAsync(title, content, "Voucher", null, user.Id);

                try
                {
                    var html = $"<div style=\"text-align:center;font-family:Arial,sans-serif\"><h1 style=\"color:#0085FF\">{v.Code}</h1><p>{content}</p></div>";
                    if (!string.IsNullOrWhiteSpace(user.Email))
                    {
                        await _emailService.SendEmailAsync(user.Email, title, html);
                        sent++;
                    }
                }
                catch (System.Exception ex)
                {
                    if (!string.IsNullOrWhiteSpace(user.Email)) failed.Add(user.Email);
                    _logger?.LogError(ex, "Failed to send voucher {VoucherId} to birthday user {Email}", v.Id, user.Email);
                }
            }

            return Ok(new { sent = sent, failed = failed });
        }

        [HttpPost("{id}/toggle-active")]
        public async Task<IActionResult> ToggleActive(int id)
        {
            var v = await _context.Vouchers.FirstOrDefaultAsync(x => x.Id == id);
            if (v == null) return NotFound();

            v.IsDeleted = !v.IsDeleted;
            v.DeletedAt = v.IsDeleted ? DateTime.UtcNow : null;
            await _context.SaveChangesAsync();

            return Ok(new { isDeleted = v.IsDeleted });
        }
    }
}
