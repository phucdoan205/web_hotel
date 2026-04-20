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

        // Cấu hình JsonSerializer hỗ trợ tiếng Việt
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

            var auditEntries = new List<AuditLog>();

            foreach (var entry in context.ChangeTracker.Entries())
            {
                if (entry.Entity is AuditLog || entry.State == EntityState.Unchanged || entry.State == EntityState.Detached)
                    continue;

                var audit = CreateAuditEntry(entry);
                if (audit != null)
                    auditEntries.Add(audit);
            }

            if (auditEntries.Any())
            {
                await context.AuditLogs.AddRangeAsync(auditEntries, cancellationToken);
            }

            return await base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private AuditLog? CreateAuditEntry(EntityEntry entry)
        {
            var entityType = entry.Metadata.ClrType.Name;
            var recordId = GetPrimaryKeyValue(entry);

            // Nếu là entity mới (temporary key) thì RecordId vẫn để tạm (sẽ thành dương sau SaveChanges)
            if (recordId == 0 && entry.State == EntityState.Added)
                recordId = -1; // hoặc giữ nguyên tạm thời

            var userId = GetCurrentUserId();

            string action = entry.State switch
            {
                EntityState.Added => "CREATE",
                EntityState.Modified => "UPDATE",
                EntityState.Deleted => "DELETE",
                _ => null
            };

            if (action == null) return null;

            // Xử lý Soft Delete
            if (entry.Entity is ISoftDelete softDelete && 
                entry.State == EntityState.Modified && 
                softDelete.IsDeleted)
            {
                action = "SOFT_DELETE";
            }

            var oldValues = (entry.State == EntityState.Modified || entry.State == EntityState.Deleted)
                ? GetValues(entry.OriginalValues)
                : null;

            var newValues = (entry.State == EntityState.Added || entry.State == EntityState.Modified)
                ? GetValues(entry.CurrentValues)
                : null;

            return new AuditLog
            {
                UserId = userId,
                Action = action,
                TableName = entityType,
                RecordId = recordId,
                OldValue = oldValues,
                NewValue = newValues,
                CreatedAt = DateTime.UtcNow
            };
        }

        private int GetPrimaryKeyValue(EntityEntry entry)
        {
            var key = entry.Metadata.FindPrimaryKey()?.Properties.FirstOrDefault();
            if (key == null) return 0;

            var value = entry.Property(key.Name).CurrentValue;
            return value is int id ? id : 0;
        }

        private string? GetValues(PropertyValues values)
        {
            var dict = new Dictionary<string, object?>();
            foreach (var prop in values.Properties)
            {
                var name = prop.Name;
                if (name is "PasswordHash") continue;
                dict[name] = values[name];
            }
            return JsonSerializer.Serialize(dict, JsonOptions);
        }

        private int? GetCurrentUserId()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return null;

            // Ưu tiên lấy từ Header X-User-Id (cách bạn đang dùng ở nhiều controller)
            var header = httpContext.Request.Headers["X-User-Id"].ToString();
            if (!string.IsNullOrWhiteSpace(header) && int.TryParse(header, out var headerId))
                return headerId;

            // Fallback từ JWT Claims
            var claim = httpContext.User.FindFirst("sub")?.Value 
                     ?? httpContext.User.FindFirst("nameid")?.Value 
                     ?? httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            return int.TryParse(claim, out var claimId) ? claimId : null;
        }
    }
}