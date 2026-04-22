using backend.Common;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace backend.Data.Interceptors
{
    public class AuditSaveChangesInterceptor : SaveChangesInterceptor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
            WriteIndented = false,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        public AuditSaveChangesInterceptor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            if (eventData.Context is not AppDbContext context)
                return await base.SavingChangesAsync(eventData, result, cancellationToken);

            var events = new List<AuditEvent>();

            foreach (var entry in context.ChangeTracker.Entries())
            {
                if (entry.Entity is AuditLog ||
                    entry.State == EntityState.Unchanged ||
                    entry.State == EntityState.Detached)
                    continue;

                var auditEvent = CreateAuditEvent(entry);
                if (auditEvent != null)
                    events.Add(auditEvent);
            }

            if (events.Any())
            {
                var logEntry = new AuditLog
                {
                    UserId = GetCurrentUserId(),
                    LogDate = DateTime.UtcNow,
                    LogData = JsonSerializer.Serialize(new
                    {
                        TotalEvents = events.Count,
                        Events = events
                    }, JsonOptions)
                };

                context.AuditLogs.Add(logEntry);
            }

            return await base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private AuditEvent? CreateAuditEvent(EntityEntry entry)
        {
            var entityType = entry.Metadata.ClrType.Name;
            var recordId = GetPrimaryKeyValue(entry);

            string actionType = entry.State switch
            {
                EntityState.Added => "CREATE",
                EntityState.Modified => "UPDATE",
                EntityState.Deleted => "DELETE",
                _ => null
            };

            if (actionType == null) return null;

            // Xử lý Soft Delete
            if (entry.Entity is ISoftDelete softDelete &&
                entry.State == EntityState.Modified &&
                softDelete.IsDeleted)
            {
                actionType = "SOFT_DELETE";
            }

            var oldData = (entry.State == EntityState.Modified || entry.State == EntityState.Deleted)
                ? GetValues(entry.OriginalValues)
                : null;

            var newData = (entry.State == EntityState.Added || entry.State == EntityState.Modified)
                ? GetValues(entry.CurrentValues)
                : null;

            // Message tiếng Việt (có thể mở rộng sau)
            var message = actionType switch
            {
                "CREATE" => $"Tạo mới {entityType} #{recordId}",
                "UPDATE" => $"Cập nhật {entityType} #{recordId}",
                "DELETE" => $"Xóa {entityType} #{recordId}",
                "SOFT_DELETE" => $"Soft delete {entityType} #{recordId}",
                _ => $"Thay đổi {entityType} #{recordId}"
            };

            return new AuditEvent
            {
                EventId = Guid.NewGuid().ToString(),
                Timestamp = DateTime.UtcNow,
                ActionType = actionType,
                EntityType = entityType,
                Context = new { RecordId = recordId },
                Changes = new { OldData = oldData, NewData = newData },
                Message = message
            };
        }

        private int GetPrimaryKeyValue(EntityEntry entry)
        {
            var key = entry.Metadata.FindPrimaryKey()?.Properties.FirstOrDefault();
            if (key == null) return 0;
            var value = entry.Property(key.Name).CurrentValue;
            return value is int id ? id : 0;
        }

        private object? GetValues(PropertyValues values)
        {
            var dict = new Dictionary<string, object?>();
            foreach (var prop in values.Properties)
            {
                if (prop.Name == "PasswordHash") continue;
                dict[prop.Name] = values[prop.Name];
            }
            return dict;
        }

        private int? GetCurrentUserId()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return null;

            var header = httpContext.Request.Headers["X-User-Id"].ToString();
            if (!string.IsNullOrWhiteSpace(header) && int.TryParse(header, out var id))
                return id;

            var claim = httpContext.User.FindFirst("sub")?.Value
                     ?? httpContext.User.FindFirst("nameid")?.Value
                     ?? httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            return int.TryParse(claim, out var claimId) ? claimId : null;
        }
    }
}