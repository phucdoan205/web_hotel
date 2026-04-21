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

        // GET: api/Logs/settings  → Lấy cấu hình hiện tại
        [HttpGet("settings")]
        public async Task<ActionResult<AuditLogSettingDTO>> GetRetentionSettings()
        {
            var setting = await _context.AuditLogSettings.FindAsync(1);
            if (setting == null)
            {
                // Tạo mặc định nếu chưa có
                setting = new AuditLogSetting { Id = 1 };
                _context.AuditLogSettings.Add(setting);
                await _context.SaveChangesAsync();
            }

            var dto = _mapper.Map<AuditLogSettingDTO>(setting);
            return Ok(dto);
        }

        // POST: api/Logs/settings  → Thay đổi thời gian giữ log
        [HttpPost("settings")]
        public async Task<IActionResult> UpdateRetentionSettings([FromBody] AuditLogSettingDTO dto)
        {
            var setting = await _context.AuditLogSettings.FindAsync(1);
            if (setting == null)
            {
                setting = new AuditLogSetting { Id = 1 };
                _context.AuditLogSettings.Add(setting);
            }

            setting.RetentionYears = dto.RetentionYears;
            setting.RetentionMonths = dto.RetentionMonths;
            setting.RetentionDays = dto.RetentionDays;
            setting.RetentionHours = dto.RetentionHours;
            setting.RetentionMinutes = dto.RetentionMinutes;
            setting.RetentionSeconds = dto.RetentionSeconds;
            setting.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã cập nhật thời gian giữ log thành công." });
        }

        // POST: api/Logs/cleanup  → Chạy dọn dẹp ngay lập tức (manual)
        [HttpPost("cleanup")]
        public async Task<IActionResult> ManualCleanup()
        {
            using var scope = HttpContext.RequestServices.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<AuditLogCleanupService>();
            await service.PerformCleanupAsync();
            return Ok(new { message = "Đã chạy dọn dẹp log thủ công thành công." });
        }
    }
}
