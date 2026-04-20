using backend.Data;
using backend.Models;
using System.Text.Json;

namespace backend.Services
{
    public class AuditLogService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditLogService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task LogAsync(
            string action,
            string tableName,
            int recordId,
            object? oldValue = null,
            object? newValue = null,
            int? userId = null)
        {
            var currentUserId = userId ?? GetCurrentUserId();

            var log = new AuditLog
            {
                UserId = currentUserId,
                Action = action,
                TableName = tableName,
                RecordId = recordId,
                OldValue = oldValue != null ? JsonSerializer.Serialize(oldValue) : null,
                NewValue = newValue != null ? JsonSerializer.Serialize(newValue) : null,
                CreatedAt = DateTime.UtcNow
            };

            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        private int? GetCurrentUserId()
        {
            // Ưu tiên lấy từ Header (lấy từ X-User-Id)
            var header = _httpContextAccessor.HttpContext?.Request.Headers["X-User-Id"];
            if (!string.IsNullOrEmpty(header) && int.TryParse(header, out var id))
                return id;

            // Hoặc lấy từ Claims (nếu dùng JWT đầy đủ)
            var claim = _httpContextAccessor.HttpContext?.User.FindFirst("sub")?.Value
                     ?? _httpContextAccessor.HttpContext?.User.FindFirst("nameid")?.Value;

            return int.TryParse(claim, out var uid) ? uid : null;
        }
    }
}