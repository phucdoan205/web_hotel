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

            var userId = GetCurrentUserId();
            if (userId == null)
                return await base.SavingChangesAsync(eventData, result, cancellationToken);

            foreach (var entry in context.ChangeTracker.Entries())
            {
                if (entry.Entity is AuditLog ||
                    entry.Metadata.ClrType.Name == "RoleDashboardPeriodState" ||
                    entry.State == EntityState.Unchanged ||
                    entry.State == EntityState.Detached)
                    continue;

                var auditEvent = CreateAuditEvent(entry);
                if (auditEvent != null)
                    events.Add(auditEvent);
            }

            if (events.Any())
            {
                GenerateNotifications(context, events);

                var today = DateTime.UtcNow.Date;

                // Tìm log của user này trong ngày hôm nay
                var existingLog = await context.AuditLogs
                    .FirstOrDefaultAsync(l => l.UserId == userId && l.LogDate >= today, cancellationToken);

                if (existingLog != null)
                {
                    try
                    {
                        var payload = JsonSerializer.Deserialize<AuditPayload>(existingLog.LogData, JsonOptions) ?? new AuditPayload();
                        payload.Events.InsertRange(0, events);
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

            // Message tiếng Việt rút gọn và thông minh hơn
            var entityName = MapEntityName(entityType, entry);
            var message = actionType switch
            {
                "CREATE" => entityType switch
                {
                    "Booking" => $"Đặt phòng {GetEntityIdentifier(entry)}",
                    "BookingDetail" => $"Đặt mới {entityName}",
                    "Invoice" => $"Tạo {entityName}",
                    "Payment" => $"Thanh toán {GetPaymentRoomIdentifier(entry)}",
                    _ => $"Thêm {entityName}"
                },
                "UPDATE" => entityType switch
                {
                    "BookingDetail" => ResolveBookingDetailUpdateMessage(entry, entityName),
                    "Invoice" => ResolveInvoiceUpdateMessage(entry, entityName),
                    "Room" => ResolveRoomUpdateMessage(entry, entityName),
                    _ => $"Sửa {entityName}"
                },
                "DELETE" => $"Xóa {entityName}",
                "SOFT_DELETE" => $"Xóa {entityName}",
                _ => $"Thay đổi {entityName}"
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
                "BookingDetail" => (entry.CurrentValues["RoomId"] as int?).HasValue && entry.Context is AppDbContext db ? $"phòng {db.Rooms.Find(entry.CurrentValues["RoomId"])?.RoomNumber ?? "mới"}" : "phòng",
                "Invoice" => "hóa đơn",
                "User" => "nhân viên",
                "Role" => "phân quyền",
                "Article" => "bài viết",
                "Voucher" => "voucher",
                "Notification" => "thông báo",
                "Membership" => "hạng thành viên",
                "Payment" => "thanh toán",
                "PaymentMethod" => "phương thức thanh toán",
                "Service" => "dịch vụ",
                _ => entityType
            };

            // Đặc biệt cho Invoice
            if (entityType == "Invoice")
            {
                var roomNumber = entry.State == EntityState.Deleted 
                    ? entry.OriginalValues["RoomNumber"]?.ToString() 
                    : entry.CurrentValues["RoomNumber"]?.ToString();
                var code = entry.State == EntityState.Deleted
                    ? entry.OriginalValues["Code"]?.ToString()
                    : entry.CurrentValues["Code"]?.ToString();
                
                if (string.IsNullOrEmpty(code)) code = $"#{GetPrimaryKeyValue(entry)}";
                
                return $"hóa đơn phòng {roomNumber} mã {code}";
            }

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
                             ?? entry.Metadata.GetProperties().FirstOrDefault(p => p.Name == "BookingCode")
                             ?? entry.Metadata.GetProperties().FirstOrDefault(p => p.Name == "Code")
                             ?? entry.Metadata.GetProperties().FirstOrDefault(p => p.Name == "TransactionCode")
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

        private string ResolveBookingDetailUpdateMessage(EntityEntry entry, string defaultName)
        {
            var statusProp = entry.Property("Status");
            if (statusProp.IsModified)
            {
                var oldStatus = statusProp.OriginalValue?.ToString();
                var newStatus = statusProp.CurrentValue?.ToString();

                var roomNumber = (entry.CurrentValues["RoomId"] as int?).HasValue && entry.Context is AppDbContext db 
                    ? db.Rooms.Find(entry.CurrentValues["RoomId"])?.RoomNumber 
                    : null;
                
                var identifier = roomNumber ?? GetEntityIdentifier(entry);

                if (newStatus == "CheckedIn") return $"Check in cho phòng {identifier}";
                if (newStatus == "CheckedOut") return $"Check out cho phòng {identifier}";
                if (newStatus == "Confirmed" && oldStatus == "Pending") return $"Xác nhận đặt phòng {identifier}";
                if (newStatus == "Cancelled") return $"Hủy đặt phòng {identifier}";
            }
            return $"Sửa {defaultName}";
        }

        private string ResolveRoomUpdateMessage(EntityEntry entry, string defaultName)
        {
            try {
                var cleaningProp = entry.Property("CleaningStatus");
                if (cleaningProp.IsModified)
                {
                    var newStatus = cleaningProp.CurrentValue?.ToString();
                    if (newStatus == "Clean") return $"Phòng {GetEntityIdentifier(entry)} đã dọn xong";
                }
            } catch {}

            try {
                var statusProp = entry.Property("Status");
                if (statusProp.IsModified)
                {
                    var newStatus = statusProp.CurrentValue?.ToString();
                    if (newStatus == "Occupied") return $"Đã check in {defaultName}";
                    if (newStatus == "Available") return $"Đã check out {defaultName}";
                }
            } catch {}
            
            return $"Sửa {defaultName}";
        }

        private string ResolveInvoiceUpdateMessage(EntityEntry entry, string defaultName)
        {
            var statusProp = entry.Property("Status");
            if (statusProp.IsModified)
            {
                var newStatus = statusProp.CurrentValue?.ToString();
                if (newStatus == "Paid") return $"Thanh toán {defaultName}";
            }
            return $"Sửa {defaultName}";
        }

        private string GetPaymentRoomIdentifier(EntityEntry entry)
        {
            try
            {
                // Nếu là Payment, thử lấy RoomNumber từ Invoice liên quan nếu nó cũng đang được track
                if (entry.Entity is Payment payment && entry.Context is AppDbContext context)
                {
                    var invoice = context.ChangeTracker.Entries<Invoice>()
                        .FirstOrDefault(e => e.Entity.Id == payment.InvoiceId)?.Entity;

                    if (invoice == null)
                    {
                        invoice = context.Invoices.Find(payment.InvoiceId);
                    }

                    if (invoice != null) 
                        return $"hóa đơn phòng {invoice.RoomNumber} mã {invoice.Code ?? $"#{invoice.Id}"}";
                }
            }
            catch { }
            return GetEntityIdentifier(entry);
        }

        private void GenerateNotifications(AppDbContext context, List<AuditEvent> events)
        {
            var notifications = new List<Notification>();
            var userId = GetCurrentUserId();
            foreach (var e in events)
            {
                if (e.Message.StartsWith("Đặt mới phòng "))
                {
                    notifications.Add(new Notification
                    {
                        UserId = userId,
                        Title = "Booking mới",
                        Content = $"Booking của {e.Message.Replace("Đặt mới ", "")} mới được đặt",
                        Type = "Booking",
                        CreatedAt = DateTime.UtcNow
                    });
                }
                else if (e.Message.StartsWith("Check in cho phòng "))
                {
                    notifications.Add(new Notification
                    {
                        UserId = userId,
                        Title = "Khách Check-in",
                        Content = $"Khách của phòng {e.Message.Replace("Check in cho phòng ", "")} check-in",
                        Type = "CheckIn",
                        CreatedAt = DateTime.UtcNow
                    });
                }
                else if (e.Message.StartsWith("Thanh toán hóa đơn phòng "))
                {
                    notifications.Add(new Notification
                    {
                        UserId = userId,
                        Title = "Thanh toán thành công",
                        Content = $"Thanh toán phòng {e.Message.Replace("Thanh toán hóa đơn phòng ", "").Split(" mã ")[0]} thành công",
                        Type = "Payment",
                        CreatedAt = DateTime.UtcNow
                    });
                }
                else if (e.Message.StartsWith("Phòng ") && e.Message.EndsWith(" đã dọn xong"))
                {
                    notifications.Add(new Notification
                    {
                        UserId = userId,
                        Title = "Phòng đã dọn",
                        Content = e.Message,
                        Type = "Housekeeping",
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            if (notifications.Any())
            {
                context.Notifications.AddRange(notifications);
            }
        }

        private class AuditPayload
        {
            public int TotalEvents { get; set; }
            public List<AuditEvent> Events { get; set; } = new();
        }
    }

}