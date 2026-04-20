using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Text.Json;
using backend.Common;

namespace backend.Data.Interceptors
{
    public class AuditSaveChangesInterceptor : SaveChangesInterceptor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

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
                if (entry.Entity is AuditLog) continue; // Tránh loop vô hạn

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
            var entityType = entry.Entity.GetType().Name;
            var recordId = GetPrimaryKeyValue(entry);

            if (recordId == 0) return null;

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

            var oldValues = entry.State == EntityState.Modified || entry.State == EntityState.Deleted
                ? GetOriginalValues(entry)
                : null;

            var newValues = entry.State == EntityState.Added || entry.State == EntityState.Modified
                ? GetCurrentValues(entry)
                : null;

            return new AuditLog
            {
                UserId = userId,
                Action = action,
                TableName = entityType,
                RecordId = recordId,
                OldValue = oldValues != null ? JsonSerializer.Serialize(oldValues) : null,
                NewValue = newValues != null ? JsonSerializer.Serialize(newValues) : null,
                CreatedAt = DateTime.UtcNow
            };
        }

        private int GetPrimaryKeyValue(EntityEntry entry)
        {
            var keyProperty = entry.Metadata.FindPrimaryKey()?.Properties.FirstOrDefault();
            if (keyProperty == null) return 0;

            var value = entry.Property(keyProperty.Name).CurrentValue;
            return value is int id ? id : 0;
        }

        private object? GetOriginalValues(EntityEntry entry)
        {
            var dict = new Dictionary<string, object?>();
            foreach (var prop in entry.OriginalValues.Properties)
            {
                var name = prop.Name;
                if (name is "PasswordHash" or "IsDeleted" or "DeletedAt") continue; // ẩn thông tin nhạy cảm
                dict[name] = entry.OriginalValues[name];
            }
            return dict;
        }

        private object? GetCurrentValues(EntityEntry entry)
        {
            var dict = new Dictionary<string, object?>();
            foreach (var prop in entry.CurrentValues.Properties)
            {
                var name = prop.Name;
                if (name is "PasswordHash") continue;
                dict[name] = entry.CurrentValues[name];
            }
            return dict;
        }

        private int? GetCurrentUserId()
        {
            // Ưu tiên X-User-Id header (cách bạn đang dùng)
            var header = _httpContextAccessor.HttpContext?.Request.Headers["X-User-Id"].ToString();
            if (!string.IsNullOrEmpty(header) && int.TryParse(header, out var id))
                return id;

            // Fallback từ Claims (JWT)
            var claim = _httpContextAccessor.HttpContext?.User.FindFirst("sub")?.Value
                     ?? _httpContextAccessor.HttpContext?.User.FindFirst("nameid")?.Value;

            return int.TryParse(claim, out var uid) ? uid : null;
        }
    }
}