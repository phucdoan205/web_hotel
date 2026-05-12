using backend.Common;
using backend.Data;
using backend.DTOs.Audit;
using backend.Models;
using backend.Security;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/Logs")]
    public class LogsController : ControllerBase
    {
        private const string HiddenUserRoleName = "User";
        private readonly AppDbContext _context;
        private readonly AuditLogViewService _auditLogViewService;

        public LogsController(AppDbContext context, AuditLogViewService auditLogViewService)
        {
            _context = context;
            _auditLogViewService = auditLogViewService;
        }

        [HttpGet]
        [Permission("VIEW_LOG")]
        public async Task<ActionResult<PagedResponse<AuditLogResponseDTO>>> GetAllLogs(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] string? employeeName = null,
            [FromQuery] string? roleName = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            CancellationToken cancellationToken = default)
        {
            var query = BuildLogQuery(employeeName, roleName, fromDate, toDate);
            var totalCount = await query.CountAsync(cancellationToken);

            var logs = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var dtos = await _auditLogViewService.BuildResponseAsync(logs, cancellationToken);
            return Ok(new PagedResponse<AuditLogResponseDTO>(dtos, totalCount, page, pageSize));
        }

        [HttpGet("user/{userId}")]
        [Permission("VIEW_LOG")]
        public async Task<ActionResult<PagedResponse<AuditLogResponseDTO>>> GetLogsByUserId(
            int userId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            CancellationToken cancellationToken = default)
        {
            var query = _context.AuditLogs
                .AsNoTracking()
                .Include(a => a.User)
                    .ThenInclude(u => u!.Role)
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.LogDate);

            var totalCount = await query.CountAsync(cancellationToken);
            var logs = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var dtos = await _auditLogViewService.BuildResponseAsync(logs, cancellationToken);
            return Ok(new PagedResponse<AuditLogResponseDTO>(dtos, totalCount, page, pageSize));
        }

        [HttpGet("filters")]
        [Permission("VIEW_LOG")]
        public async Task<ActionResult<AuditLogFilterOptionsDTO>> GetFilterOptions(CancellationToken cancellationToken = default)
        {
            var response = await _auditLogViewService.GetFilterOptionsAsync(cancellationToken);
            return Ok(response);
        }

        [HttpGet("export")]
        [Permission("EXPLORT_LOG")]
        public async Task<IActionResult> ExportLogs(
            [FromQuery] string? employeeName = null,
            [FromQuery] string? roleName = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            CancellationToken cancellationToken = default)
        {
            var logs = await BuildLogQuery(employeeName, roleName, fromDate, toDate)
                .ToListAsync(cancellationToken);

            var dtos = await _auditLogViewService.BuildResponseAsync(logs, cancellationToken);
            var content = _auditLogViewService.ExportSpreadsheet(dtos);
            var fileName = $"audit-log-{DateTime.UtcNow:yyyyMMddHHmmss}.xls";
            return File(content, "application/vnd.ms-excel", fileName);
        }

        [HttpGet("settings")]
        public async Task<ActionResult<AuditLogSettingDTO>> GetRetentionSettings()
        {
            await EnsureDefaultSettingsAsync();

            var settings = await GetAllSettingsDictAsync();

            var dto = new AuditLogSettingDTO
            {
                RetentionYears = GetInt(settings, "RetentionYears"),
                RetentionMonths = GetInt(settings, "RetentionMonths"),
                RetentionDays = GetInt(settings, "RetentionDays"),
                RetentionHours = GetInt(settings, "RetentionHours"),
                RetentionMinutes = GetInt(settings, "RetentionMinutes"),
                RetentionSeconds = GetInt(settings, "RetentionSeconds"),
                CleanupIntervalYears = GetInt(settings, "CleanupIntervalYears"),
                CleanupIntervalMonths = GetInt(settings, "CleanupIntervalMonths"),
                CleanupIntervalDays = GetInt(settings, "CleanupIntervalDays"),
                CleanupHour = GetInt(settings, "CleanupHour", 20),
                CleanupMinute = GetInt(settings, "CleanupMinute", 0)
            };

            return Ok(dto);
        }

        [HttpPost("settings")]
        public async Task<IActionResult> UpdateRetentionSettings([FromBody] AuditLogSettingDTO dto)
        {
            await EnsureDefaultSettingsAsync();

            await UpdateSettingAsync("RetentionYears", dto.RetentionYears.ToString());
            await UpdateSettingAsync("RetentionMonths", dto.RetentionMonths.ToString());
            await UpdateSettingAsync("RetentionDays", dto.RetentionDays.ToString());
            await UpdateSettingAsync("RetentionHours", dto.RetentionHours.ToString());
            await UpdateSettingAsync("RetentionMinutes", dto.RetentionMinutes.ToString());
            await UpdateSettingAsync("RetentionSeconds", dto.RetentionSeconds.ToString());
            await UpdateSettingAsync("CleanupIntervalYears", dto.CleanupIntervalYears.ToString());
            await UpdateSettingAsync("CleanupIntervalMonths", dto.CleanupIntervalMonths.ToString());
            await UpdateSettingAsync("CleanupIntervalDays", dto.CleanupIntervalDays.ToString());
            await UpdateSettingAsync("CleanupHour", dto.CleanupHour.ToString());
            await UpdateSettingAsync("CleanupMinute", dto.CleanupMinute.ToString());

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã cập nhật cấu hình Audit Log thành công." });
        }

        private IQueryable<AuditLog> BuildLogQuery(
            string? employeeName,
            string? roleName,
            DateTime? fromDate,
            DateTime? toDate)
        {
            var query = _context.AuditLogs
                .AsNoTracking()
                .Include(a => a.User)
                    .ThenInclude(u => u!.Role)
                .AsQueryable();

            query = query.Where(a => a.User == null || a.User.Role == null || a.User.Role.Name != HiddenUserRoleName);

            if (!string.IsNullOrWhiteSpace(employeeName))
            {
                var normalizedName = employeeName.Trim();
                query = query.Where(a => a.User != null && a.User.FullName.Contains(normalizedName));
            }

            if (!string.IsNullOrWhiteSpace(roleName))
            {
                var normalizedRole = roleName.Trim();
                query = query.Where(a => a.User != null && a.User.Role != null && a.User.Role.Name == normalizedRole);
            }

            if (fromDate.HasValue)
            {
                var start = fromDate.Value.Date;
                query = query.Where(a => a.LogDate >= start);
            }

            if (toDate.HasValue)
            {
                var endExclusive = toDate.Value.Date.AddDays(1);
                query = query.Where(a => a.LogDate < endExclusive);
            }

            return query.OrderByDescending(a => a.LogDate);
        }

        private async Task EnsureDefaultSettingsAsync()
        {
            var existingNames = await _context.AuditLogSettings
                .Select(s => s.ConfigName)
                .ToListAsync();

            var defaults = new Dictionary<string, string>
            {
                { "RetentionYears", "0" }, { "RetentionMonths", "6" }, { "RetentionDays", "0" },
                { "RetentionHours", "0" }, { "RetentionMinutes", "0" }, { "RetentionSeconds", "0" },
                { "CleanupIntervalYears", "0" }, { "CleanupIntervalMonths", "3" }, { "CleanupIntervalDays", "0" },
                { "CleanupHour", "20" }, { "CleanupMinute", "0" }
            };

            var changed = false;
            foreach (var kv in defaults)
            {
                if (!existingNames.Contains(kv.Key))
                {
                    _context.AuditLogSettings.Add(new AuditLogSetting
                    {
                        ConfigName = kv.Key,
                        Value = kv.Value,
                        UpdatedAt = DateTime.Now
                    });
                    changed = true;
                }
            }

            if (changed)
            {
                await _context.SaveChangesAsync();
            }
        }

        private async Task<Dictionary<string, string>> GetAllSettingsDictAsync()
        {
            return await _context.AuditLogSettings
                .ToDictionaryAsync(s => s.ConfigName, s => s.Value);
        }

        private static int GetInt(Dictionary<string, string> settings, string key, int defaultValue = 0)
        {
            return settings.TryGetValue(key, out var str) && int.TryParse(str, out var val)
                ? val
                : defaultValue;
        }

        private async Task UpdateSettingAsync(string configName, string value)
        {
            var setting = await _context.AuditLogSettings
                .FirstOrDefaultAsync(s => s.ConfigName == configName);

            if (setting == null)
            {
                setting = new AuditLogSetting
                {
                    ConfigName = configName,
                    Value = value,
                    UpdatedAt = DateTime.Now
                };
                _context.AuditLogSettings.Add(setting);
            }
            else
            {
                setting.Value = value;
                setting.UpdatedAt = DateTime.Now;
            }
        }
    }
}
