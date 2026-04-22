using System.Globalization;
using System.Text;
using System.Text.Json;
using backend.Data;
using backend.DTOs.Audit;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class AuditLogViewService
    {
        private readonly AppDbContext _context;

        public AuditLogViewService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<AuditLogResponseDTO>> BuildResponseAsync(
            List<AuditLog> logs,
            CancellationToken cancellationToken = default)
        {
            var parsedLogs = logs
                .Select(log => new ParsedAuditLog(log, ParsePayload(log.LogData)))
                .ToList();

            var roomInventoryIds = parsedLogs
                .SelectMany(item => item.Payload.Events)
                .SelectMany(GetRoomInventoryIds)
                .Distinct()
                .ToList();

            var roomInventoryLookup = await _context.RoomInventory
                .AsNoTracking()
                .Include(item => item.Room)
                .Include(item => item.Equipment)
                .Where(item => roomInventoryIds.Contains(item.Id))
                .ToDictionaryAsync(
                    item => item.Id,
                    item => new RoomInventoryAuditInfo
                    {
                        RoomNumber = item.Room?.RoomNumber,
                        EquipmentName = item.Equipment?.Name ?? item.ItemType
                    },
                    cancellationToken);

            return parsedLogs.Select(item =>
            {
                var events = item.Payload.Events
                    .Select(eventItem => MapEvent(eventItem, roomInventoryLookup))
                    .ToList();

                return new AuditLogResponseDTO
                {
                    Id = item.Log.Id,
                    UserId = item.Log.UserId,
                    UserName = item.Log.User?.FullName,
                    RoleName = item.Log.User?.Role?.Name,
                    LogDate = item.Log.LogDate,
                    LogData = item.Log.LogData,
                    Summary = events.FirstOrDefault()?.Summary ?? "Không có dữ liệu chi tiết.",
                    TotalEvents = events.Count,
                    Events = events
                };
            }).ToList();
        }

        public async Task<AuditLogFilterOptionsDTO> GetFilterOptionsAsync(CancellationToken cancellationToken = default)
        {
            var roles = await _context.AuditLogs
                .AsNoTracking()
                .Include(log => log.User)
                    .ThenInclude(user => user!.Role)
                .Where(log => log.User != null && log.User.Role != null)
                .Select(log => log.User!.Role!.Name)
                .Where(name =>
                    !string.Equals(name, "User", StringComparison.OrdinalIgnoreCase) &&
                    !string.Equals(name, "Guest", StringComparison.OrdinalIgnoreCase))
                .Distinct()
                .OrderBy(name => name)
                .ToListAsync(cancellationToken);

            var employees = await _context.AuditLogs
                .AsNoTracking()
                .Include(log => log.User)
                .Where(log => log.User != null && !string.IsNullOrWhiteSpace(log.User.FullName))
                .Select(log => log.User!.FullName)
                .Distinct()
                .OrderBy(name => name)
                .ToListAsync(cancellationToken);

            return new AuditLogFilterOptionsDTO
            {
                Roles = roles,
                Employees = employees
            };
        }

        public byte[] ExportSpreadsheet(List<AuditLogResponseDTO> logs)
        {
            var rows = logs.SelectMany(log => log.Events.Select(@event => new ExportRow
            {
                LogDate = log.LogDate,
                UserName = log.UserName ?? "System",
                RoleName = log.RoleName ?? "-",
                EventTime = @event.Timestamp,
                ActionLabel = @event.ActionLabel,
                ObjectName = @event.ObjectName,
                Detail = @event.Detail
            })).ToList();

            var xml = new StringBuilder();
            xml.Append("<?xml version=\"1.0\"?>");
            xml.Append("<?mso-application progid=\"Excel.Sheet\"?>");
            xml.Append("<Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\"");
            xml.Append(" xmlns:o=\"urn:schemas-microsoft-com:office:office\"");
            xml.Append(" xmlns:x=\"urn:schemas-microsoft-com:office:excel\"");
            xml.Append(" xmlns:ss=\"urn:schemas-microsoft-com:office:spreadsheet\">");
            xml.Append("<Styles>");
            xml.Append("<Style ss:ID=\"Header\"><Font ss:Bold=\"1\"/><Interior ss:Color=\"#E7F0FF\" ss:Pattern=\"Solid\"/></Style>");
            xml.Append("<Style ss:ID=\"Wrap\"><Alignment ss:Vertical=\"Top\" ss:WrapText=\"1\"/></Style>");
            xml.Append("</Styles>");
            xml.Append("<Worksheet ss:Name=\"AuditLogs\"><Table>");

            xml.Append("<Row ss:StyleID=\"Header\">");
            AppendCell(xml, "Ngày lưu log");
            AppendCell(xml, "Tên");
            AppendCell(xml, "Vai trò");
            AppendCell(xml, "Thời gian");
            AppendCell(xml, "Loại hành động");
            AppendCell(xml, "Đối tượng");
            AppendCell(xml, "Nội dung chi tiết");
            xml.Append("</Row>");

            foreach (var row in rows)
            {
                xml.Append("<Row>");
                AppendCell(xml, row.LogDate.ToLocalTime().ToString("dd/MM/yyyy", CultureInfo.InvariantCulture));
                AppendCell(xml, row.UserName);
                AppendCell(xml, row.RoleName);
                AppendCell(xml, row.EventTime.ToLocalTime().ToString("HH:mm:ss dd/MM/yyyy", CultureInfo.InvariantCulture));
                AppendCell(xml, row.ActionLabel);
                AppendCell(xml, row.ObjectName);
                AppendCell(xml, row.Detail, "Wrap");
                xml.Append("</Row>");
            }

            xml.Append("</Table></Worksheet></Workbook>");
            return Encoding.UTF8.GetBytes(xml.ToString());
        }

        private static void AppendCell(StringBuilder xml, string value, string? styleId = null)
        {
            xml.Append(styleId == null ? "<Cell>" : $"<Cell ss:StyleID=\"{styleId}\">");
            xml.Append("<Data ss:Type=\"String\">");
            xml.Append(EscapeXml(value));
            xml.Append("</Data></Cell>");
        }

        private static string EscapeXml(string? value)
        {
            return string.IsNullOrEmpty(value)
                ? string.Empty
                : value
                    .Replace("&", "&amp;")
                    .Replace("<", "&lt;")
                    .Replace(">", "&gt;")
                    .Replace("\"", "&quot;")
                    .Replace("'", "&apos;");
        }

        private static AuditPayload ParsePayload(string? logData)
        {
            if (string.IsNullOrWhiteSpace(logData))
            {
                return new AuditPayload();
            }

            try
            {
                return JsonSerializer.Deserialize<AuditPayload>(logData, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? new AuditPayload();
            }
            catch (JsonException)
            {
                return new AuditPayload();
            }
        }

        private static IEnumerable<int> GetRoomInventoryIds(AuditPayloadEvent auditEvent)
        {
            var values = new List<int>();

            if (string.Equals(auditEvent.EntityType, "RoomInventory", StringComparison.OrdinalIgnoreCase) &&
                TryGetInt(auditEvent.Context, "RecordId", out var ownId))
            {
                values.Add(ownId);
            }

            foreach (var source in new[] { auditEvent.Changes.OldData, auditEvent.Changes.NewData })
            {
                if (TryGetInt(source, "RoomInventoryId", out var roomInventoryId))
                {
                    values.Add(roomInventoryId);
                }
            }

            return values;
        }

        private static AuditLogEventResponseDTO MapEvent(
            AuditPayloadEvent auditEvent,
            IReadOnlyDictionary<int, RoomInventoryAuditInfo> roomInventoryLookup)
        {
            var actionLabel = auditEvent.ActionType switch
            {
                "CREATE" => "Tạo mới",
                "UPDATE" => "Cập nhật",
                "DELETE" => "Xóa",
                "SOFT_DELETE" => "Xóa mềm",
                _ => auditEvent.ActionType
            };

            return new AuditLogEventResponseDTO
            {
                EventId = auditEvent.EventId,
                Timestamp = auditEvent.Timestamp,
                ActionType = auditEvent.ActionType,
                ActionLabel = actionLabel,
                EntityType = auditEvent.EntityType,
                ObjectName = MapObjectName(auditEvent.EntityType),
                Summary = BuildSummary(auditEvent, roomInventoryLookup),
                Detail = BuildDetail(auditEvent, roomInventoryLookup)
            };
        }

        private static string BuildSummary(
            AuditPayloadEvent auditEvent,
            IReadOnlyDictionary<int, RoomInventoryAuditInfo> roomInventoryLookup)
        {
            if (string.Equals(auditEvent.EntityType, "LossAndDamage", StringComparison.OrdinalIgnoreCase))
            {
                var focus = ResolveLossDamageFocus(auditEvent, roomInventoryLookup);
                return auditEvent.ActionType switch
                {
                    "CREATE" => $"Ghi nhận hư hỏng {focus}.",
                    "UPDATE" => $"Cập nhật báo cáo hư hỏng {focus}.",
                    "DELETE" => $"Hủy báo cáo đền bù {focus}.",
                    _ => $"{MapActionVerb(auditEvent.ActionType)} {focus}."
                };
            }

            var target = BuildEntityTarget(auditEvent, roomInventoryLookup);
            return $"{MapActionVerb(auditEvent.ActionType)} {target}.";
        }

        private static string BuildDetail(
            AuditPayloadEvent auditEvent,
            IReadOnlyDictionary<int, RoomInventoryAuditInfo> roomInventoryLookup)
        {
            if (string.Equals(auditEvent.EntityType, "LossAndDamage", StringComparison.OrdinalIgnoreCase))
            {
                return BuildLossDamageDetail(auditEvent, roomInventoryLookup);
            }

            var changedFields = DescribeChangedFields(auditEvent.Changes.OldData, auditEvent.Changes.NewData);
            if (!string.IsNullOrWhiteSpace(changedFields))
            {
                return $"{BuildSummary(auditEvent, roomInventoryLookup)} {changedFields}";
            }

            var snapshot = auditEvent.ActionType == "DELETE"
                ? DescribeSnapshotFields(auditEvent.Changes.OldData)
                : DescribeSnapshotFields(auditEvent.Changes.NewData);

            return string.IsNullOrWhiteSpace(snapshot)
                ? (auditEvent.Message ?? BuildSummary(auditEvent, roomInventoryLookup))
                : $"{BuildSummary(auditEvent, roomInventoryLookup)} {snapshot}";
        }

        private static string BuildLossDamageDetail(
            AuditPayloadEvent auditEvent,
            IReadOnlyDictionary<int, RoomInventoryAuditInfo> roomInventoryLookup)
        {
            var source = auditEvent.ActionType == "DELETE" ? auditEvent.Changes.OldData : auditEvent.Changes.NewData;
            if (source.ValueKind == JsonValueKind.Undefined || source.ValueKind == JsonValueKind.Null)
            {
                source = auditEvent.Changes.OldData;
            }

            TryGetInt(source, "RoomInventoryId", out var roomInventoryId);
            roomInventoryLookup.TryGetValue(roomInventoryId, out var inventory);

            var description = GetString(source, "Description");
            var quantity = GetString(source, "Quantity");
            var penalty = GetDecimal(source, "PenaltyAmount");

            var parts = new List<string>
            {
                BuildSummary(auditEvent, roomInventoryLookup)
            };

            if (!string.IsNullOrWhiteSpace(inventory?.EquipmentName))
            {
                parts.Add($"Thiết bị: {inventory.EquipmentName}.");
            }

            if (!string.IsNullOrWhiteSpace(inventory?.RoomNumber))
            {
                parts.Add($"Phòng: {inventory.RoomNumber}.");
            }

            if (!string.IsNullOrWhiteSpace(quantity))
            {
                parts.Add($"Số lượng: {quantity}.");
            }

            if (penalty.HasValue)
            {
                parts.Add($"Mức đền bù: {penalty.Value.ToString("#,##0.##", CultureInfo.InvariantCulture)}.");
            }

            if (!string.IsNullOrWhiteSpace(description))
            {
                parts.Add($"Mô tả: {description}.");
            }

            var changedFields = DescribeChangedFields(auditEvent.Changes.OldData, auditEvent.Changes.NewData);
            if (!string.IsNullOrWhiteSpace(changedFields) && auditEvent.ActionType == "UPDATE")
            {
                parts.Add(changedFields);
            }

            return string.Join(" ", parts.Where(part => !string.IsNullOrWhiteSpace(part)));
        }

        private static string DescribeChangedFields(JsonElement oldData, JsonElement newData)
        {
            if (oldData.ValueKind != JsonValueKind.Object || newData.ValueKind != JsonValueKind.Object)
            {
                return string.Empty;
            }

            var allNames = oldData.EnumerateObject().Select(prop => prop.Name)
                .Concat(newData.EnumerateObject().Select(prop => prop.Name))
                .Distinct()
                .Where(name => !IgnoredFields.Contains(name))
                .ToList();

            var changes = new List<string>();
            foreach (var name in allNames)
            {
                var oldValue = GetComparableValue(oldData, name);
                var newValue = GetComparableValue(newData, name);

                if (string.Equals(oldValue, newValue, StringComparison.Ordinal))
                {
                    continue;
                }

                changes.Add($"{MapFieldName(name)}: {oldValue ?? "-"} -> {newValue ?? "-"}");
            }

            return changes.Count == 0 ? string.Empty : $"Thay đổi: {string.Join("; ", changes)}.";
        }

        private static string DescribeSnapshotFields(JsonElement source)
        {
            if (source.ValueKind != JsonValueKind.Object)
            {
                return string.Empty;
            }

            var fields = source.EnumerateObject()
                .Where(prop => !IgnoredFields.Contains(prop.Name))
                .Select(prop => new
                {
                    Name = MapFieldName(prop.Name),
                    Value = GetComparableValue(source, prop.Name)
                })
                .Where(item => !string.IsNullOrWhiteSpace(item.Value))
                .Take(4)
                .Select(item => $"{item.Name}: {item.Value}")
                .ToList();

            return fields.Count == 0 ? string.Empty : $"Chi tiết: {string.Join("; ", fields)}.";
        }

        private static string BuildEntityTarget(
            AuditPayloadEvent auditEvent,
            IReadOnlyDictionary<int, RoomInventoryAuditInfo> roomInventoryLookup)
        {
            if (string.Equals(auditEvent.EntityType, "RoomInventory", StringComparison.OrdinalIgnoreCase) &&
                TryGetInt(auditEvent.Context, "RecordId", out var roomInventoryId) &&
                roomInventoryLookup.TryGetValue(roomInventoryId, out var inventory))
            {
                return $"vật tư {inventory.EquipmentName ?? "phòng"}";
            }

            return auditEvent.EntityType switch
            {
                "Room" => $"phòng {GetString(auditEvent.Changes.NewData, "RoomNumber") ?? GetString(auditEvent.Changes.OldData, "RoomNumber") ?? GetRecordId(auditEvent)}",
                "Equipment" => $"thiết bị {GetString(auditEvent.Changes.NewData, "Name") ?? GetString(auditEvent.Changes.OldData, "Name") ?? GetRecordId(auditEvent)}",
                "Booking" => $"đặt phòng {GetString(auditEvent.Changes.NewData, "BookingCode") ?? GetString(auditEvent.Changes.OldData, "BookingCode") ?? GetRecordId(auditEvent)}",
                "User" => $"nhân viên {GetString(auditEvent.Changes.NewData, "FullName") ?? GetString(auditEvent.Changes.OldData, "FullName") ?? GetRecordId(auditEvent)}",
                _ => $"{auditEvent.EntityType} #{GetRecordId(auditEvent)}"
            };
        }

        private static string ResolveLossDamageFocus(
            AuditPayloadEvent auditEvent,
            IReadOnlyDictionary<int, RoomInventoryAuditInfo> roomInventoryLookup)
        {
            var source = auditEvent.ActionType == "DELETE" ? auditEvent.Changes.OldData : auditEvent.Changes.NewData;
            if (source.ValueKind == JsonValueKind.Undefined || source.ValueKind == JsonValueKind.Null)
            {
                source = auditEvent.Changes.OldData;
            }

            TryGetInt(source, "RoomInventoryId", out var roomInventoryId);
            roomInventoryLookup.TryGetValue(roomInventoryId, out var inventory);

            var equipmentName = inventory?.EquipmentName ?? GetString(source, "Description") ?? "vật dụng";
            var roomNumber = inventory?.RoomNumber;

            return string.IsNullOrWhiteSpace(roomNumber)
                ? equipmentName
                : $"{equipmentName} tại phòng {roomNumber}";
        }

        private static string MapActionVerb(string actionType)
        {
            return actionType switch
            {
                "CREATE" => "Tạo mới",
                "UPDATE" => "Cập nhật",
                "DELETE" => "Xóa",
                "SOFT_DELETE" => "Xóa mềm",
                _ => "Thay đổi"
            };
        }

        private static string MapObjectName(string entityType)
        {
            return entityType switch
            {
                "LossAndDamage" => "Trang bồi thường",
                "Room" => "Trang quản lý phòng",
                "RoomInventory" => "Trang tồn kho phòng",
                "Equipment" => "Trang thiết bị",
                "Booking" => "Trang đặt phòng",
                "BookingDetail" => "Trang chi tiết đặt phòng",
                "Invoice" => "Trang hóa đơn",
                "User" => "Trang nhân viên",
                "Role" => "Trang phân quyền",
                "Article" => "Trang bài viết",
                "Voucher" => "Trang voucher",
                "Notification" => "Trang thông báo",
                _ => $"Trang {entityType}"
            };
        }

        private static string GetRecordId(AuditPayloadEvent auditEvent)
        {
            return TryGetInt(auditEvent.Context, "RecordId", out var recordId)
                ? recordId.ToString(CultureInfo.InvariantCulture)
                : "?";
        }

        private static bool TryGetInt(JsonElement element, string propertyName, out int value)
        {
            value = 0;
            if (element.ValueKind != JsonValueKind.Object || !element.TryGetProperty(propertyName, out var property))
            {
                return false;
            }

            return property.ValueKind switch
            {
                JsonValueKind.Number => property.TryGetInt32(out value),
                JsonValueKind.String => int.TryParse(property.GetString(), out value),
                _ => false
            };
        }

        private static string? GetString(JsonElement element, string propertyName)
        {
            if (element.ValueKind != JsonValueKind.Object || !element.TryGetProperty(propertyName, out var property))
            {
                return null;
            }

            return property.ValueKind switch
            {
                JsonValueKind.String => property.GetString(),
                JsonValueKind.Number => property.ToString(),
                JsonValueKind.True => "Có",
                JsonValueKind.False => "Không",
                JsonValueKind.Null => null,
                _ => property.ToString()
            };
        }

        private static decimal? GetDecimal(JsonElement element, string propertyName)
        {
            if (element.ValueKind != JsonValueKind.Object || !element.TryGetProperty(propertyName, out var property))
            {
                return null;
            }

            if (property.ValueKind == JsonValueKind.Number && property.TryGetDecimal(out var value))
            {
                return value;
            }

            return property.ValueKind == JsonValueKind.String &&
                   decimal.TryParse(property.GetString(), out var parsed)
                ? parsed
                : null;
        }

        private static string? GetComparableValue(JsonElement element, string propertyName)
        {
            return GetString(element, propertyName);
        }

        private static string MapFieldName(string propertyName)
        {
            return propertyName switch
            {
                "RoomNumber" => "Số phòng",
                "Floor" => "Tầng",
                "Status" => "Trạng thái",
                "CleaningStatus" => "Tình trạng dọn phòng",
                "Quantity" => "Số lượng",
                "PenaltyAmount" => "Mức đền bù",
                "Description" => "Mô tả",
                "PriceIfLost" => "Giá đền bù",
                "FullName" => "Họ tên",
                "Email" => "Email",
                "Name" => "Tên",
                "BookingCode" => "Mã đặt phòng",
                "CheckInDate" => "Ngày nhận phòng",
                "CheckOutDate" => "Ngày trả phòng",
                _ => propertyName
            };
        }

        private static readonly HashSet<string> IgnoredFields = new(StringComparer.OrdinalIgnoreCase)
        {
            "Id",
            "CreatedAt",
            "UpdatedAt",
            "DeletedAt",
            "PasswordHash"
        };

        private sealed class ParsedAuditLog
        {
            public ParsedAuditLog(AuditLog log, AuditPayload payload)
            {
                Log = log;
                Payload = payload;
            }

            public AuditLog Log { get; }
            public AuditPayload Payload { get; }
        }

        private sealed class RoomInventoryAuditInfo
        {
            public string? RoomNumber { get; set; }
            public string? EquipmentName { get; set; }
        }

        private sealed class ExportRow
        {
            public DateTime LogDate { get; set; }
            public string UserName { get; set; } = string.Empty;
            public string RoleName { get; set; } = string.Empty;
            public DateTime EventTime { get; set; }
            public string ActionLabel { get; set; } = string.Empty;
            public string ObjectName { get; set; } = string.Empty;
            public string Detail { get; set; } = string.Empty;
        }

        private sealed class AuditPayload
        {
            public int TotalEvents { get; set; }
            public List<AuditPayloadEvent> Events { get; set; } = new();
        }

        private sealed class AuditPayloadEvent
        {
            public string EventId { get; set; } = string.Empty;
            public DateTime Timestamp { get; set; }
            public string ActionType { get; set; } = string.Empty;
            public string EntityType { get; set; } = string.Empty;
            public JsonElement Context { get; set; }
            public AuditPayloadChanges Changes { get; set; } = new();
            public string Message { get; set; } = string.Empty;
        }

        private sealed class AuditPayloadChanges
        {
            public JsonElement OldData { get; set; }
            public JsonElement NewData { get; set; }
        }
    }
}
