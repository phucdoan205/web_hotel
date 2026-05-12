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
                var userId = GetCurrentUserId();
                var today = DateTime.UtcNow.Date;

                // Tìm log của user này trong ngày hôm nay
                var existingLog = await context.AuditLogs
                    .FirstOrDefaultAsync(l => l.UserId == userId && l.LogDate >= today, cancellationToken);

                if (existingLog != null)
                {
                    try
                    {
                        var payload = JsonSerializer.Deserialize<AuditPayload>(existingLog.LogData, JsonOptions) ?? new AuditPayload();
                        payload.Events.AddRange(events);
                        payload.TotalEvents = payload.Events.Count;
                        existingLog.LogData = JsonSerializer.Serialize(payload, JsonOptions);
                        // existingLog đã được track bởi context, không cần context.Update
                    }
                    catch
                    {
                        // Nếu parse lỗi, tạo log mới cho an toàn
                        await CreateNewLog(context, userId, events);
                    }
                }
                else
                {
                    await CreateNewLog(context, userId, events);
                }
            }

            return await base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private async Task CreateNewLog(AppDbContext context, int? userId, List<AuditEvent> events)
        {
            var logEntry = new AuditLog
            {
                UserId = userId,
                LogDate = DateTime.UtcNow,
                LogData = JsonSerializer.Serialize(new AuditPayload
                {
                    TotalEvents = events.Count,
                    Events = events
                }, JsonOptions)
            };
            await context.AuditLogs.AddAsync(logEntry);
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

            // Message tiếng Việt rút gọn
            var message = actionType switch
            {
                "CREATE" => $"Thêm {MapEntityName(entityType, entry)}",
                "UPDATE" => $"Sửa {MapEntityName(entityType, entry)}",
                "DELETE" => $"Xóa {MapEntityName(entityType, entry)}",
                "SOFT_DELETE" => $"Xóa {MapEntityName(entityType, entry)}",
                _ => $"Thay đổi {MapEntityName(entityType, entry)}"
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

        private string MapEntityName(string entityType, EntityEntry entry)
        {
            var name = entityType switch
            {
                "LossAndDamage" => "báo cáo hư hỏng",
                "Room" => "phòng",
                "RoomInventory" => "vật tư phòng",
                "Equipment" => "thiết bị",
                "Booking" => "đặt phòng",
                "BookingDetail" => "chi tiết đặt phòng",
                "Invoice" => "hóa đơn",
                "User" => "nhân viên",
                "Role" => "phân quyền",
                "Article" => "bài viết",
                "Voucher" => "voucher",
                "Notification" => "thông báo",
                "Membership" => "hạng thành viên",
                _ => entityType
            };

            var identifier = GetEntityIdentifier(entry);
            return string.IsNullOrEmpty(identifier) ? name : $"{name} {identifier}";
        }

        private string GetEntityIdentifier(EntityEntry entry)
        {
            try
            {
                var values = (entry.State == EntityState.Deleted || entry.State == EntityState.Detached) 
                    ? entry.OriginalValues 
                    : entry.CurrentValues;

                var idProp = entry.Metadata.GetProperties()
                    .FirstOrDefault(p => p.Name == "RoomNumber")
                             ?? entry.Metadata.GetProperties().FirstOrDefault(p => p.Name == "Name")
                             ?? entry.Metadata.GetProperties().FirstOrDefault(p => p.Name == "Code")
                             ?? entry.Metadata.GetProperties().FirstOrDefault(p => p.Name == "FullName")
                             ?? entry.Metadata.GetProperties().FirstOrDefault(p => p.Name == "Title")
                             ?? entry.Metadata.GetProperties().FirstOrDefault(p => p.Name == "TierName");

                if (idProp != null)
                {
                    var val = values[idProp.Name];
                    return val?.ToString() ?? "";
                }
            }
            catch { }

            return $"#{GetPrimaryKeyValue(entry)}";
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

        private class AuditPayload
        {
            public int TotalEvents { get; set; }
            public List<AuditEvent> Events { get; set; } = new();
        }
    }

}