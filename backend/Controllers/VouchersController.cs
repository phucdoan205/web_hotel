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

        public VouchersController(
            AppDbContext context,
            NotificationService notificationService,
            IEmailService emailService,
            ILogger<VouchersController> logger)
        {
            _context = context;
            _notificationService = notificationService;
            _emailService = emailService;
            _logger = logger;
        }

        private static string FormatVoucherValue(Voucher voucher)
        {
            return string.Equals(voucher.DiscountType, "PERCENT", StringComparison.OrdinalIgnoreCase)
                ? $"{voucher.DiscountValue}%"
                : $"{voucher.DiscountValue:N0} VND";
        }

        private static string BuildVoucherEmailHtml(
            Voucher voucher,
            string heading,
            string introText,
            string? customMessage)
        {
            var validFrom = voucher.ValidFrom?.ToString("dd/MM/yyyy") ?? "-";
            var validTo = voucher.ValidTo?.ToString("dd/MM/yyyy") ?? "-";
            var minBookingValue = voucher.MinBookingValue.HasValue
                ? $"{voucher.MinBookingValue.Value:N0} VND"
                : "Không yêu cầu";
            var messageBlock = string.IsNullOrWhiteSpace(customMessage)
                ? ""
                : $@"
      <div style=""margin:0 0 20px;padding:14px 16px;border-radius:14px;background:#eff6ff;color:#0f172a;font-size:14px;line-height:1.7;"">
        {System.Net.WebUtility.HtmlEncode(customMessage)}
      </div>";

            return $@"
<div style=""margin:0;padding:32px 16px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;"">
  <div style=""max-width:640px;margin:0 auto;background:#ffffff;border-radius:28px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 18px 50px rgba(15,23,42,.08);"">
    <div style=""padding:36px 36px 28px;background:linear-gradient(135deg,#0284c7,#2563eb 55%,#06b6d4);color:#ffffff;"">
      <div style=""font-size:12px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;opacity:.85;"">Hotel Voucher</div>
      <h1 style=""margin:14px 0 10px;font-size:30px;line-height:1.2;font-weight:800;"">{heading}</h1>
      <p style=""margin:0;font-size:15px;line-height:1.8;color:rgba(255,255,255,.92);"">{introText}</p>
    </div>
    <div style=""padding:32px 36px 36px;"">
      {messageBlock}
      <div style=""margin-bottom:24px;padding:24px;border-radius:24px;background:#0f172a;text-align:center;"">
        <div style=""font-size:12px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:#93c5fd;"">Mã voucher</div>
        <div style=""margin-top:12px;font-size:34px;font-weight:800;letter-spacing:.12em;color:#ffffff;"">{voucher.Code}</div>
      </div>
      <div style=""display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:24px;"">
        <div style=""padding:18px;border-radius:20px;background:#f8fafc;border:1px solid #e2e8f0;"">
          <div style=""font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#94a3b8;"">Ưu đãi</div>
          <div style=""margin-top:10px;font-size:22px;font-weight:800;color:#0f172a;"">{FormatVoucherValue(voucher)}</div>
        </div>
        <div style=""padding:18px;border-radius:20px;background:#f8fafc;border:1px solid #e2e8f0;"">
          <div style=""font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#94a3b8;"">Thời hạn</div>
          <div style=""margin-top:10px;font-size:14px;font-weight:700;color:#0f172a;line-height:1.7;"">{validFrom} - {validTo}</div>
        </div>
        <div style=""padding:18px;border-radius:20px;background:#f8fafc;border:1px solid #e2e8f0;"">
          <div style=""font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#94a3b8;"">Đặt tối thiểu</div>
          <div style=""margin-top:10px;font-size:14px;font-weight:700;color:#0f172a;line-height:1.7;"">{minBookingValue}</div>
        </div>
      </div>
      <div style=""padding:18px 20px;border-radius:20px;background:#eff6ff;color:#1e3a8a;font-size:14px;line-height:1.8;"">
        Vui lòng lưu lại mã voucher và áp dụng khi đặt phòng để nhận ưu đãi. Nếu cần hỗ trợ thêm, bạn có thể liên hệ trực tiếp với khách sạn.
      </div>
    </div>
  </div>
</div>";
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] bool includeDeleted = false)
        {
            var query = includeDeleted
                ? _context.Vouchers.IgnoreQueryFilters().AsQueryable()
                : _context.Vouchers.AsQueryable();

            var list = await query
                .OrderByDescending(v => v.Id)
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
                    IsActive = v.IsActive,
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
            var query = includeDeleted
                ? _context.Vouchers.IgnoreQueryFilters().AsNoTracking()
                : _context.Vouchers.AsNoTracking();

            var voucher = await query.FirstOrDefaultAsync(x => x.Id == id && (includeDeleted || !x.IsDeleted));
            if (voucher == null) return NotFound();

            var dto = new VoucherDTO
            {
                Id = voucher.Id,
                Code = voucher.Code,
                DiscountType = voucher.DiscountType,
                DiscountValue = voucher.DiscountValue,
                MinBookingValue = voucher.MinBookingValue,
                ValidFrom = voucher.ValidFrom,
                ValidTo = voucher.ValidTo,
                UsageLimit = voucher.UsageLimit,
                UsageCount = voucher.UsageCount,
                IsPrivate = voucher.IsPrivate,
                IsActive = voucher.IsActive,
                IsDeleted = voucher.IsDeleted,
                DeletedAt = voucher.DeletedAt
            };
            return Ok(dto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] VoucherDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Code)) return BadRequest("Code is required");

            if (dto.ValidFrom.HasValue && dto.ValidTo.HasValue && dto.ValidFrom.Value > dto.ValidTo.Value)
            {
                return BadRequest("Invalid date range: ValidFrom must be before ValidTo");
            }

            var voucher = new Voucher
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
                IsActive = true,
                IsDeleted = false,
                DeletedAt = null
            };

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();

            dto.Id = voucher.Id;
            return Ok(dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] VoucherDTO dto)
        {
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
            if (voucher == null) return NotFound();

            if (dto.ValidFrom.HasValue && dto.ValidTo.HasValue && dto.ValidFrom.Value > dto.ValidTo.Value)
            {
                return BadRequest("Invalid date range: ValidFrom must be before ValidTo");
            }

            voucher.Code = dto.Code ?? voucher.Code;
            voucher.DiscountType = dto.DiscountType ?? voucher.DiscountType;
            voucher.DiscountValue = dto.DiscountValue;
            voucher.MinBookingValue = dto.MinBookingValue;
            voucher.ValidFrom = dto.ValidFrom;
            voucher.ValidTo = dto.ValidTo;
            voucher.UsageLimit = dto.UsageLimit;
            voucher.IsPrivate = dto.IsPrivate;
            voucher.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
            if (voucher == null) return NotFound();

            voucher.IsDeleted = true;
            voucher.DeletedAt = DateTime.UtcNow;
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
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(x => x.Id == request.VoucherId && !x.IsDeleted);
            if (voucher == null) return NotFound();

            var recipients = request.Recipients ?? new List<string>();
            if (recipients.Count > 0)
            {
                voucher.IsPrivate = true;
                await _context.SaveChangesAsync();
            }

            var sent = 0;
            var failed = new List<string>();
            foreach (var email in recipients)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                var title = $"Bạn nhận được voucher {voucher.Code}";
                var contentText = $"Mã: {voucher.Code}\nƯu đãi: {FormatVoucherValue(voucher)}\nHạn dùng: {voucher.ValidFrom?.ToShortDateString()} - {voucher.ValidTo?.ToShortDateString()}";
                if (!string.IsNullOrWhiteSpace(request.Message))
                {
                    contentText = request.Message + "\n\n" + contentText;
                }

                await _notificationService.CreateAsync(title, contentText, "Voucher", null, user?.Id);

                try
                {
                    var html = BuildVoucherEmailHtml(
                        voucher,
                        "Ưu đãi đặc biệt dành cho bạn",
                        "Cảm ơn bạn đã đồng hành cùng khách sạn. Chúng tôi gửi tặng bạn một voucher ưu đãi để sử dụng cho kỳ nghỉ tiếp theo.",
                        request.Message);
                    await _emailService.SendEmailAsync(email, title, html);
                    sent++;
                }
                catch (Exception ex)
                {
                    failed.Add(email);
                    _logger?.LogError(ex, "Failed to send voucher {VoucherId} to {Email}", voucher.Id, email);
                }
            }

            return Ok(new { sent, failed });
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
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(x => x.Id == request.VoucherId && !x.IsDeleted);
            if (voucher == null) return NotFound();

            var targetDate = request.Date?.Date ?? DateTime.Today;
            var users = await _context.Users
                .Where(u => u.DateOfBirth.HasValue &&
                            u.DateOfBirth.Value.Day == targetDate.Day &&
                            u.DateOfBirth.Value.Month == targetDate.Month)
                .ToListAsync();

            var sent = 0;
            var failed = new List<string>();
            foreach (var user in users)
            {
                var title = $"Chúc mừng sinh nhật - {voucher.Code}";
                var content = $"Chúc mừng sinh nhật {user.FullName}! Tặng bạn mã {voucher.Code} - ưu đãi {FormatVoucherValue(voucher)}. Hạn dùng: {voucher.ValidFrom?.ToShortDateString()} - {voucher.ValidTo?.ToShortDateString()}";
                if (!string.IsNullOrWhiteSpace(request.Message))
                {
                    content = request.Message + "\n\n" + content;
                }

                await _notificationService.CreateAsync(title, content, "Voucher", null, user.Id);

                try
                {
                    var html = BuildVoucherEmailHtml(
                        voucher,
                        "Quà tặng sinh nhật dành riêng cho bạn",
                        "Khách sạn chúc bạn có một ngày sinh nhật thật trọn vẹn và gửi tặng bạn voucher ưu đãi này.",
                        request.Message);

                    if (!string.IsNullOrWhiteSpace(user.Email))
                    {
                        await _emailService.SendEmailAsync(user.Email, title, html);
                        sent++;
                    }
                }
                catch (Exception ex)
                {
                    if (!string.IsNullOrWhiteSpace(user.Email)) failed.Add(user.Email);
                    _logger?.LogError(ex, "Failed to send voucher {VoucherId} to birthday user {Email}", voucher.Id, user.Email);
                }
            }

            return Ok(new { sent, failed });
        }

        [HttpPost("{id}/toggle-active")]
        public async Task<IActionResult> ToggleActive(int id)
        {
            var voucher = await _context.Vouchers.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
            if (voucher == null) return NotFound();

            voucher.IsActive = !voucher.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new { isActive = voucher.IsActive });
        }

        public class TestSmtpRequest
        {
            public string To { get; set; } = string.Empty;
            public string Subject { get; set; } = "Test email";
            public string Body { get; set; } = "Test body";
        }

        [HttpPost("test-smtp")]
        public async Task<IActionResult> TestSmtp([FromBody] TestSmtpRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.To)) return BadRequest("To is required");
            try
            {
                await _emailService.SendEmailAsync(req.To, req.Subject, req.Body);
                return Ok(new { ok = true });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "SMTP test send failed");
                return StatusCode(500, new { ok = false, error = ex.Message });
            }
        }
    }
}
