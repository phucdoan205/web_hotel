using System.Text.Json;
using backend.Common;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Security;
using backend.Services;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
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
        private readonly CloudinaryService _cloudinaryService;

        public VouchersController(
            AppDbContext context,
            NotificationService notificationService,
            IEmailService emailService,
            ILogger<VouchersController> logger,
            CloudinaryService cloudinaryService
        )
        {
            _context = context;
            _notificationService = notificationService;
            _emailService = emailService;
            _logger = logger;
            _cloudinaryService = cloudinaryService;
        }

        private int? ResolveCurrentUserId()
        {
            var header = Request.Headers["X-User-Id"].ToString();
            if (!string.IsNullOrWhiteSpace(header) && int.TryParse(header, out var headerUserId))
            {
                return headerUserId;
            }

            var claim =
                User.FindFirst("sub")?.Value
                ?? User.FindFirst("nameid")?.Value
                ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            return int.TryParse(claim, out var claimUserId) ? claimUserId : null;
        }

        private async Task CreateVoucherSendAuditLogAsync(
            Voucher voucher,
            string dispatchType,
            int sentCount,
            IEnumerable<string>? recipients = null
        )
        {
            if (sentCount <= 0) return;

            var recipientList = recipients
                ?.Where(item => !string.IsNullOrWhiteSpace(item))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Take(10)
                .ToList() ?? new List<string>();

            var auditEvent = new AuditEvent
            {
                EventId = Guid.NewGuid().ToString(),
                Timestamp = DateTime.UtcNow,
                ActionType = "UPDATE",
                EntityType = "Voucher",
                Context = new { RecordId = voucher.Id },
                Changes = new
                {
                    NewData = new
                    {
                        VoucherId = voucher.Id,
                        Code = voucher.Code,
                        DispatchType = dispatchType,
                        SentCount = sentCount,
                        Recipients = recipientList,
                    },
                },
                Message = $"Gửi voucher {voucher.Code} cho {sentCount} khách hàng",
            };

            var userId = ResolveCurrentUserId();
            var today = DateTime.UtcNow.Date;

            var existingLog = await _context.AuditLogs
                .FirstOrDefaultAsync(l => l.UserId == userId && l.LogDate >= today);

            var options = new JsonSerializerOptions
            {
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
                PropertyNameCaseInsensitive = true
            };

            if (existingLog != null)
            {
                try
                {
                    var payload = JsonSerializer.Deserialize<AuditPayload>(existingLog.LogData, options) ?? new AuditPayload();
                    payload.Events.Add(auditEvent);
                    payload.TotalEvents = payload.Events.Count;
                    existingLog.LogData = JsonSerializer.Serialize(payload, options);
                }
                catch
                {
                    await AddNewAuditLog(userId, auditEvent, options);
                }
            }
            else
            {
                await AddNewAuditLog(userId, auditEvent, options);
            }

            await _context.SaveChangesAsync();
        }

        private async Task AddNewAuditLog(int? userId, AuditEvent auditEvent, JsonSerializerOptions options)
        {
            _context.AuditLogs.Add(new AuditLog
            {
                UserId = userId,
                LogDate = DateTime.UtcNow,
                LogData = JsonSerializer.Serialize(new { TotalEvents = 1, Events = new[] { auditEvent } }, options)
            });
        }

        private class AuditPayload
        {
            public int TotalEvents { get; set; }
            public List<AuditEvent> Events { get; set; } = new();
        }

        private static string FormatVoucherValue(Voucher voucher)
        {
            return string.Equals(
                voucher.DiscountType,
                "PERCENT",
                StringComparison.OrdinalIgnoreCase
            )
                ? $"{voucher.DiscountValue}%"
                : $"{voucher.DiscountValue:N0} VND";
        }

        private static string BuildVoucherEmailHtml(
            Voucher voucher,
            string heading,
            string introText,
            string? customMessage
        )
        {
            var validFrom = voucher.ValidFrom?.ToString("dd/MM/yyyy") ?? "-";
            var validTo = voucher.ValidTo?.ToString("dd/MM/yyyy") ?? "-";
            var minBookingValue = voucher.MinBookingValue.HasValue
                ? $"{voucher.MinBookingValue.Value:N0} VND"
                : "Không yêu cầu";
            if (!string.IsNullOrWhiteSpace(customMessage))
            {
                customMessage = System.Text.RegularExpressions.Regex.Replace(
                    customMessage,
                    @"(<img[^>]*?)\s+style=['""][^'""]*['""]",
                    "$1",
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase
                );
                customMessage = System.Text.RegularExpressions.Regex.Replace(
                    customMessage,
                    @"(<img[^>]*?)\s+width=['""][^'""]*['""]",
                    "$1",
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase
                );
                customMessage = System.Text.RegularExpressions.Regex.Replace(
                    customMessage,
                    @"(<img[^>]*?)\s+height=['""][^'""]*['""]",
                    "$1",
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase
                );
                
                
                customMessage = System.Text.RegularExpressions.Regex.Replace(
                    customMessage,
                    @"<img\s+",
                    "<img width=\"250\" style=\"max-width: 100%; height: auto; border-radius: 12px; margin: 16px auto; display: block;\" ",
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase
                );
            }

            var messageBlock = string.IsNullOrWhiteSpace(customMessage)
                ? ""
                : $@"
      <div class=""custom-message"" style=""margin:0 0 20px;padding:14px 16px;border-radius:14px;background:#eff6ff;color:#0f172a;font-size:14px;line-height:1.7;"">
        {customMessage}
      </div>";

            return $@"
<style>
  .custom-message img {{
    max-width: 100% !important;
    max-height: 250px !important;
    width: auto !important;
    height: auto !important;
    object-fit: contain !important;
    border-radius: 12px;
    margin: 16px auto;
    display: block;
  }}
</style>
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

        [HttpGet("public")]
        public async Task<ActionResult<IEnumerable<VoucherDTO>>> GetPublicVouchers()
        {
            var today = DateTime.UtcNow.AddHours(7).Date;
            var list = await _context
                .Vouchers.Where(v =>
                    v.IsActive
                    && !v.IsPrivate
                    && (v.ValidFrom == null || v.ValidFrom <= today)
                    && (v.ValidTo == null || v.ValidTo >= today)
                )
                .OrderByDescending(v => v.Id)
                .Take(12) 
                .Select(v => new VoucherDTO
                {
                    Id = v.Id,
                    Code = v.Code,
                    Name = v.Name,
                    DiscountType = v.DiscountType,
                    DiscountValue = v.DiscountValue,
                    MinBookingValue = v.MinBookingValue,
                    ValidFrom = v.ValidFrom,
                    ValidTo = v.ValidTo,
                    Description = v.Description,
                })
                .AsNoTracking()
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet]
        [Permission("VIEW_VOUCHERS")]
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
                    Name = v.Name,
                    DiscountType = v.DiscountType,
                    DiscountValue = v.DiscountValue,
                    MinBookingValue = v.MinBookingValue,
                    ValidFrom = v.ValidFrom,
                    ValidTo = v.ValidTo,
                    UsageLimit = v.UsageLimit,
                    UsageCount = v.UsageCount,
                    Description = v.Description,
                    IsPrivate = v.IsPrivate,
                    IsActive = v.IsActive,
                    IsDeleted = v.IsDeleted,
                    DeletedAt = v.DeletedAt,
                    VoucherType = v.VoucherType,
                    TargetUserId = v.TargetUserId
                })
                .AsNoTracking()
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("{id}")]
        [Permission("VIEW_VOUCHERS")]
        public async Task<IActionResult> GetOne(int id, [FromQuery] bool includeDeleted = false)
        {
            var query = includeDeleted
                ? _context.Vouchers.IgnoreQueryFilters().AsNoTracking()
                : _context.Vouchers.AsNoTracking();

            var voucher = await query.FirstOrDefaultAsync(x =>
                x.Id == id && (includeDeleted || !x.IsDeleted)
            );
            if (voucher == null)
                return NotFound();

            var dto = new VoucherDTO
            {
                Id = voucher.Id,
                Code = voucher.Code,
                Name = voucher.Name,
                DiscountType = voucher.DiscountType,
                DiscountValue = voucher.DiscountValue,
                MinBookingValue = voucher.MinBookingValue,
                ValidFrom = voucher.ValidFrom,
                ValidTo = voucher.ValidTo,
                UsageLimit = voucher.UsageLimit,
                UsageCount = voucher.UsageCount,
                Description = voucher.Description,
                IsPrivate = voucher.IsPrivate,
                IsActive = voucher.IsActive,
                IsDeleted = voucher.IsDeleted,
                DeletedAt = voucher.DeletedAt,
                VoucherType = voucher.VoucherType,
                TargetUserId = voucher.TargetUserId
            };
            return Ok(dto);
        }

        [HttpPost]
        [Permission("CREATE_VOUCHERS")]
        public async Task<IActionResult> Create([FromBody] VoucherDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Code))
                return BadRequest("Code is required");

            if (
                dto.ValidFrom.HasValue
                && dto.ValidTo.HasValue
                && dto.ValidFrom.Value > dto.ValidTo.Value
            )
            {
                return BadRequest("Invalid date range: ValidFrom must be before ValidTo");
            }

            var voucher = new Voucher
            {
                Code = dto.Code.Trim(),
                Name = dto.Name?.Trim() ?? "Chưa đặt tên",
                DiscountType = dto.DiscountType?.Trim() ?? "PERCENT",
                DiscountValue = dto.DiscountValue,
                MinBookingValue = dto.MinBookingValue,
                ValidFrom = dto.ValidFrom,
                ValidTo = dto.ValidTo,
                UsageLimit = dto.UsageLimit,
                UsageCount = dto.UsageCount,
                Description = dto.Description,
                IsPrivate = dto.IsPrivate,
                IsActive = true,
                IsDeleted = false,
                DeletedAt = null,
                VoucherType = dto.VoucherType ?? "Booking",
                TargetUserId = dto.TargetUserId
            };

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();

            dto.Id = voucher.Id;
            return Ok(dto);
        }

        [HttpPut("{id}")]
        [Permission("EDIT_VOUCHERS")]
        public async Task<IActionResult> Update(int id, [FromBody] VoucherDTO dto)
        {
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(x =>
                x.Id == id && !x.IsDeleted
            );
            if (voucher == null)
                return NotFound();

            if (
                dto.ValidFrom.HasValue
                && dto.ValidTo.HasValue
                && dto.ValidFrom.Value > dto.ValidTo.Value
            )
            {
                return BadRequest("Invalid date range: ValidFrom must be before ValidTo");
            }

            voucher.Code = dto.Code ?? voucher.Code;
            voucher.Name = dto.Name ?? voucher.Name;
            voucher.DiscountType = dto.DiscountType ?? voucher.DiscountType;
            voucher.DiscountValue = dto.DiscountValue;
            voucher.MinBookingValue = dto.MinBookingValue;
            voucher.ValidFrom = dto.ValidFrom;
            voucher.ValidTo = dto.ValidTo;
            voucher.UsageLimit = dto.UsageLimit;
            voucher.Description = dto.Description;
            voucher.IsPrivate = dto.IsPrivate;
            voucher.IsActive = dto.IsActive;
            voucher.VoucherType = dto.VoucherType ?? voucher.VoucherType;
            voucher.TargetUserId = dto.TargetUserId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Permission("DELETE_VOUCHERS")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(x =>
                x.Id == id && !x.IsDeleted
            );
            if (voucher == null)
                return NotFound();

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
        [Permission("SEND_VOUCHER")]
        public async Task<IActionResult> SendToUsers([FromBody] SendToUsersRequest request)
        {
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(x =>
                x.Id == request.VoucherId && !x.IsDeleted
            );
            if (voucher == null)
                return NotFound();

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
                var contentText =
                    $"Mã: {voucher.Code}\nƯu đãi: {FormatVoucherValue(voucher)}\nHạn dùng: {voucher.ValidFrom?.ToShortDateString()} - {voucher.ValidTo?.ToShortDateString()}";
                if (!string.IsNullOrWhiteSpace(request.Message))
                {
                    contentText = request.Message + "\n\n" + contentText;
                }

                await _notificationService.CreateAsync(
                    title,
                    contentText,
                    "Voucher",
                    null,
                    user?.Id
                );

                try
                {
                    var html = BuildVoucherEmailHtml(
                        voucher,
                        "Ưu đãi đặc biệt dành cho bạn",
                        "Cảm ơn bạn đã đồng hành cùng khách sạn. Chúng tôi gửi tặng bạn một voucher ưu đãi để sử dụng cho kỳ nghỉ tiếp theo.",
                        request.Message
                    );
                    await _emailService.SendEmailAsync(email, title, html);
                    sent++;
                }
                catch (Exception ex)
                {
                    failed.Add(email);
                    _logger?.LogError(
                        ex,
                        "Failed to send voucher {VoucherId} to {Email}",
                        voucher.Id,
                        email
                    );
                }
            }

            await CreateVoucherSendAuditLogAsync(voucher, "SendToUsers", sent, recipients);

            return Ok(new { sent, failed });
        }

        public class SendToBirthdaysRequest
        {
            public int VoucherId { get; set; }
            public DateTime? Date { get; set; }
            public string? Message { get; set; }
        }

        [HttpPost("send/birthdays")]
        [Permission("SEND_VOUCHER")]
        public async Task<IActionResult> SendToBirthdays([FromBody] SendToBirthdaysRequest request)
        {
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(x =>
                x.Id == request.VoucherId && !x.IsDeleted
            );
            if (voucher == null)
                return NotFound();

            var targetDate = request.Date?.Date ?? DateTime.Today;
            var users = await _context
                .Users.Where(u =>
                    u.DateOfBirth.HasValue
                    && u.DateOfBirth.Value.Day == targetDate.Day
                    && u.DateOfBirth.Value.Month == targetDate.Month
                )
                .ToListAsync();

            var sent = 0;
            var failed = new List<string>();
            foreach (var user in users)
            {
                var uniqueCode = $"{voucher.Code}-{user.Id}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";
                var personalVoucher = new Voucher
                {
                    Code = uniqueCode,
                    Name = voucher.Name + $" (Sinh nhật {user.FullName})",
                    DiscountType = voucher.DiscountType,
                    DiscountValue = voucher.DiscountValue,
                    MinBookingValue = voucher.MinBookingValue,
                    ValidFrom = voucher.ValidFrom ?? targetDate,
                    ValidTo = voucher.ValidTo ?? targetDate.AddDays(30),
                    UsageLimit = 1,
                    UsageCount = 0,
                    Description = voucher.Description,
                    IsPrivate = true,
                    IsActive = true,
                    IsDeleted = false,
                    VoucherType = "Birthday",
                    TargetUserId = user.Id
                };
                _context.Vouchers.Add(personalVoucher);
                await _context.SaveChangesAsync();

                var title = $"Chúc mừng sinh nhật - {personalVoucher.Code}";
                var content =
                    $"Chúc mừng sinh nhật {user.FullName}! Tặng bạn mã {personalVoucher.Code} - ưu đãi {FormatVoucherValue(personalVoucher)}. Hạn dùng: {personalVoucher.ValidFrom?.ToShortDateString()} - {personalVoucher.ValidTo?.ToShortDateString()}";
                if (!string.IsNullOrWhiteSpace(request.Message))
                {
                    content = request.Message + "\n\n" + content;
                }

                await _notificationService.CreateAsync(title, content, "Voucher", null, user.Id);

                try
                {
                    var html = BuildVoucherEmailHtml(
                        personalVoucher,
                        "Quà tặng sinh nhật dành riêng cho bạn",
                        "Khách sạn chúc bạn có một ngày sinh nhật thật trọn vẹn và gửi tặng bạn voucher ưu đãi này.",
                        request.Message
                    );

                    if (!string.IsNullOrWhiteSpace(user.Email))
                    {
                        await _emailService.SendEmailAsync(user.Email, title, html);
                        sent++;
                    }
                }
                catch (Exception ex)
                {
                    if (!string.IsNullOrWhiteSpace(user.Email))
                        failed.Add(user.Email);
                    _logger?.LogError(
                        ex,
                        "Failed to send voucher {VoucherId} to birthday user {Email}",
                        personalVoucher.Id,
                        user.Email
                    );
                }
            }

            await CreateVoucherSendAuditLogAsync(
                voucher,
                "BirthdayCampaign",
                sent,
                users
                    .Where(item => !string.IsNullOrWhiteSpace(item.Email))
                    .Select(item => item.Email!)
            );

            return Ok(new { sent, failed });
        }

        [HttpPost("{id}/toggle-active")]
        [Permission("ENABLE_VOUCHER", "DISABLE_VOUCHER")]
        public async Task<IActionResult> ToggleActive(int id)
        {
            var voucher = await _context
                .Vouchers.IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Id == id);
            if (voucher == null)
                return NotFound();

            voucher.IsActive = !voucher.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new { isActive = voucher.IsActive });
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File không hợp lệ");

            var result = await _cloudinaryService.UploadImageAsync(file, "home/Vouchers");

            return Ok(new { url = result.ToString() });
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
            if (string.IsNullOrWhiteSpace(req.To))
                return BadRequest("To is required");
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
