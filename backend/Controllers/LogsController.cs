using AutoMapper;
using backend.Common;
using backend.Data;
using backend.DTOs.Audit;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/Logs")]
    public class LogsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public LogsController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/Logs  (xem tất cả log + phân trang)
        [HttpGet]
        public async Task<ActionResult<PagedResponse<AuditLogResponseDTO>>> GetAllLogs(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var query = _context.AuditLogs
                .Include(a => a.User)
                    .ThenInclude(u => u.Role)
                .OrderByDescending(a => a.LogDate)
                .AsNoTracking();

            var totalCount = await query.CountAsync();

            var logs = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = _mapper.Map<List<AuditLogResponseDTO>>(logs);

            var result = new PagedResponse<AuditLogResponseDTO>(dtos, totalCount, page, pageSize);
            return Ok(result);
        }

        // GET: api/Logs/user/5  (xem log theo UserId)
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<PagedResponse<AuditLogResponseDTO>>> GetLogsByUserId(
            int userId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var query = _context.AuditLogs
                .Include(a => a.User)
                    .ThenInclude(u => u.Role)
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.LogDate)
                .AsNoTracking();

            var totalCount = await query.CountAsync();

            var logs = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = _mapper.Map<List<AuditLogResponseDTO>>(logs);

            var result = new PagedResponse<AuditLogResponseDTO>(dtos, totalCount, page, pageSize);
            return Ok(result);
        }

        // ====================== SETTINGS ======================
        // GET: api/Logs/settings
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

        // POST: api/Logs/settings
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

        // ====================== HELPER METHODS (đã rút gọn) ======================

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

        { "CleanupHour", "20" }, { "CleanupMinute", "0" }   // mặc định 20:00
    };

            bool changed = false;
            foreach (var kv in defaults)
            {
                if (!existingNames.Contains(kv.Key))
                {
                    _context.AuditLogSettings.Add(new AuditLogSetting
                    {
                        ConfigName = kv.Key,
                        Value = kv.Value,
                        UpdatedAt = DateTime.UtcNow
                    });
                    changed = true;
                }
            }

            if (changed)
                await _context.SaveChangesAsync();
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
                    UpdatedAt = DateTime.UtcNow
                };
                _context.AuditLogSettings.Add(setting);
            }
            else
            {
                setting.Value = value;
                setting.UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}
