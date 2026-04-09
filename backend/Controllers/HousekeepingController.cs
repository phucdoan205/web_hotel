using backend.Common;
using backend.Data;
using backend.DTOs.Housekeeping;
using backend.DTOs.RoomInventory;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HousekeepingController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly CloudinaryService _cloudinaryService;
        private readonly HousekeepingTaskLockService _taskLockService;

        public HousekeepingController(
            AppDbContext context,
            CloudinaryService cloudinaryService,
            HousekeepingTaskLockService taskLockService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
            _taskLockService = taskLockService;
        }

        [HttpGet("tasks")]
        public async Task<ActionResult<HousekeepingTaskListResponseDTO>> GetTasks(
            [FromQuery] string? search = null,
            [FromQuery] string? status = null)
        {
            var currentUserId = ResolveCurrentUserId();
            var trackedStatuses = new[]
            {
                RoomCleaningStatuses.Dirty,
                RoomCleaningStatuses.Pickup,
                RoomCleaningStatuses.InProgress,
                RoomCleaningStatuses.Clean
            };

            var query = _context.Rooms
                .AsNoTracking()
                .Include(r => r.RoomType)
                    .ThenInclude(rt => rt!.RoomImages)
                .Include(r => r.RoomInventory)
                .Where(r =>
                    trackedStatuses.Contains(r.CleaningStatus!) &&
                    r.Status != RoomStatuses.OutOfOrder);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var normalized = search.Trim();
                query = query.Where(r =>
                    r.RoomNumber.Contains(normalized) ||
                    (r.RoomType != null && r.RoomType.Name.Contains(normalized)));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(r => r.CleaningStatus == status);
            }

            var rooms = await query
                .OrderBy(r => r.Floor)
                .ThenBy(r => r.RoomNumber)
                .ToListAsync();

            var items = rooms.Select(room => MapTaskItem(room, currentUserId, _taskLockService.GetAssignedUserId(room.Id))).ToList();

            return Ok(new HousekeepingTaskListResponseDTO
            {
                Items = items,
                TotalCount = items.Count,
                PendingCount = items.Count(item =>
                    item.CleaningStatus == RoomCleaningStatuses.Dirty ||
                    item.CleaningStatus == RoomCleaningStatuses.Pickup),
                InProgressCount = items.Count(item => item.CleaningStatus == RoomCleaningStatuses.InProgress),
                CompletedCount = items.Count(item => item.CleaningStatus == RoomCleaningStatuses.Clean)
            });
        }

        [HttpGet("tasks/{roomId:int}")]
        public async Task<ActionResult<HousekeepingTaskDetailDTO>> GetTaskDetail(int roomId)
        {
            var currentUserId = ResolveCurrentUserId();
            var room = await _context.Rooms
                .AsNoTracking()
                .Include(r => r.RoomType)
                    .ThenInclude(rt => rt!.RoomImages)
                .Include(r => r.RoomInventory)
                    .ThenInclude(ri => ri.Equipment)
                .FirstOrDefaultAsync(r => r.Id == roomId);

            if (room == null)
            {
                return NotFound("Khong tim thay phong.");
            }

            var assignedUserId = _taskLockService.GetAssignedUserId(room.Id);
            if (room.CleaningStatus == RoomCleaningStatuses.InProgress &&
                assignedUserId.HasValue &&
                currentUserId.HasValue &&
                assignedUserId.Value != currentUserId.Value)
            {
                return StatusCode(403, "Phong nay da duoc nguoi khac nhan nhiem vu.");
            }

            return Ok(MapTaskDetail(room, currentUserId, assignedUserId));
        }

        [HttpPost("tasks/{roomId:int}/accept")]
        public async Task<ActionResult<HousekeepingTaskDetailDTO>> AcceptTask(int roomId)
        {
            var currentUserId = ResolveCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized("Missing X-User-Id header.");
            }
            var room = await _context.Rooms
                .Include(r => r.RoomType)
                    .ThenInclude(rt => rt!.RoomImages)
                .Include(r => r.RoomInventory)
                    .ThenInclude(ri => ri.Equipment)
                .FirstOrDefaultAsync(r => r.Id == roomId);

            if (room == null)
            {
                return NotFound("Khong tim thay phong.");
            }

            if (room.Status == RoomStatuses.OutOfOrder)
            {
                return BadRequest("Phong dang o trang thai OutOfOrder.");
            }

            var assignedUserId = _taskLockService.GetAssignedUserId(room.Id);
            if (assignedUserId.HasValue && assignedUserId.Value != currentUserId.Value)
            {
                return Conflict("Phong nay da duoc nguoi khac nhan va dang don.");
            }

            if (room.CleaningStatus == RoomCleaningStatuses.InProgress)
            {
                if (assignedUserId == currentUserId.Value)
                {
                    return Ok(MapTaskDetail(room, currentUserId.Value, assignedUserId));
                }

                return Conflict("Phong nay da duoc nguoi khac nhan va dang don.");
            }

            if (room.CleaningStatus != RoomCleaningStatuses.Dirty &&
                room.CleaningStatus != RoomCleaningStatuses.Pickup)
            {
                return BadRequest("Chi co the nhan phong dang ban hoac can don nhe.");
            }

            room.CleaningStatus = RoomCleaningStatuses.InProgress;
            room.Status = RoomStatuses.Cleaning;
            room.LastCleaningUpdatedAt = DateTime.UtcNow;
            _taskLockService.ForceAssign(room.Id, currentUserId.Value);
            await _context.SaveChangesAsync();

            return Ok(MapTaskDetail(room, currentUserId.Value, currentUserId.Value));
        }

        [HttpPost("tasks/{roomId:int}/complete")]
        public async Task<IActionResult> CompleteTask(int roomId)
        {
            var currentUserId = ResolveCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized("Missing X-User-Id header.");
            }
            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.Id == roomId);
            if (room == null)
            {
                return NotFound("Khong tim thay phong.");
            }

            if (!_taskLockService.IsAssignedTo(roomId, currentUserId.Value))
            {
                return StatusCode(403, "Ban khong the hoan tat phong do nguoi khac da nhan.");
            }

            if (room.CleaningStatus != RoomCleaningStatuses.InProgress)
            {
                return BadRequest("Chi co the hoan tat phong dang don.");
            }

            room.CleaningStatus = RoomCleaningStatuses.Clean;
            if (room.Status == RoomStatuses.Cleaning)
            {
                room.Status = RoomStatuses.Available;
            }

            room.LastCleaningUpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            _taskLockService.Release(roomId);
            return NoContent();
        }

        [HttpPost("inventory-issues")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(20_000_000)]
        public async Task<ActionResult<ReportInventoryIssueResponseDTO>> ReportInventoryIssue([FromForm] ReportInventoryIssueRequestDTO request)
        {
            return await CreateInventoryIssueAsync(
                request.RoomInventoryId,
                request.Quantity,
                request.Description,
                request.ImageFile,
                requireTaskAssignment: true);
        }

        [HttpPost("inventory-issues/manual")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(20_000_000)]
        public async Task<ActionResult<ReportInventoryIssueResponseDTO>> ReportInventoryIssueManual([FromForm] ManualInventoryIssueRequestDTO request)
        {
            return await CreateInventoryIssueAsync(
                request.RoomInventoryId,
                request.Quantity,
                request.Description,
                request.ImageFile,
                requireTaskAssignment: false);
        }

        [HttpGet("inventory-reports")]
        public async Task<ActionResult<HousekeepingInventoryReportResponseDTO>> GetInventoryReports()
        {
            var shortageNotifications = await _context.Notifications
                .AsNoTracking()
                .Where(notification => notification.Type == "InventoryShortage")
                .OrderByDescending(notification => notification.CreatedAt)
                .ToListAsync();

            var shortageReports = shortageNotifications
                .Select(MapShortageNotification)
                .Where(item => item != null)
                .Cast<HousekeepingShortageReportItemDTO>()
                .ToList();

            var lossDamageReports = await _context.LossAndDamages
                .AsNoTracking()
                .Include(issue => issue.RoomInventory)
                    .ThenInclude(roomInventory => roomInventory!.Room)
                .Include(issue => issue.RoomInventory)
                    .ThenInclude(roomInventory => roomInventory!.Equipment)
                .OrderByDescending(issue => issue.CreatedAt)
                .Select(issue => new HousekeepingLossDamageReportItemDTO
                {
                    Id = issue.Id,
                    RoomInventoryId = issue.RoomInventoryId ?? 0,
                    RoomId = issue.RoomInventory != null ? issue.RoomInventory.RoomId : null,
                    RoomNumber = issue.RoomInventory != null && issue.RoomInventory.Room != null
                        ? issue.RoomInventory.Room.RoomNumber
                        : "-",
                    EquipmentId = issue.RoomInventory != null ? issue.RoomInventory.EquipmentId : null,
                    EquipmentName = issue.RoomInventory != null
                        ? issue.RoomInventory.Equipment != null
                            ? issue.RoomInventory.Equipment.Name
                            : issue.RoomInventory.ItemType ?? "Vat tu"
                        : "Vat tu",
                    EquipmentCode = issue.RoomInventory != null && issue.RoomInventory.Equipment != null
                        ? issue.RoomInventory.Equipment.ItemCode
                        : null,
                    Quantity = issue.Quantity,
                    UnitPenalty = issue.Quantity > 0
                        ? decimal.Round(issue.PenaltyAmount / issue.Quantity, 2)
                        : 0,
                    PenaltyAmount = issue.PenaltyAmount,
                    Description = issue.Description,
                    ImageUrl = issue.ImageUrl,
                    CreatedAt = issue.CreatedAt
                })
                .ToListAsync();

            return Ok(new HousekeepingInventoryReportResponseDTO
            {
                ShortageReports = shortageReports,
                LossDamageReports = lossDamageReports,
                ShortageReportCount = shortageReports.Count,
                ShortageUnitCount = shortageReports.Sum(item => item.ShortageQuantity),
                LossDamageReportCount = lossDamageReports.Count,
                LossDamageUnitCount = lossDamageReports.Sum(item => item.Quantity),
                TotalPenaltyAmount = lossDamageReports.Sum(item => item.PenaltyAmount)
            });
        }

        private async Task<ActionResult<ReportInventoryIssueResponseDTO>> CreateInventoryIssueAsync(
            int roomInventoryId,
            int quantity,
            string? description,
            IFormFile? imageFile,
            bool requireTaskAssignment)
        {
            var currentUserId = ResolveCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized("Missing X-User-Id header.");
            }

            if (quantity <= 0)
            {
                return BadRequest("So luong hu hong phai lon hon 0.");
            }

            var roomInventory = await _context.RoomInventory
                .Include(ri => ri.Room)
                .Include(ri => ri.Equipment)
                .FirstOrDefaultAsync(ri => ri.Id == roomInventoryId);

            if (roomInventory == null || roomInventory.Room == null)
            {
                return NotFound("Khong tim thay vat tu phong.");
            }

            if (requireTaskAssignment && !_taskLockService.IsAssignedTo(roomInventory.Room.Id, currentUserId.Value))
            {
                return StatusCode(403, "Ban khong the bao hong do phong nay do nguoi khac phu trach.");
            }

            var currentQuantity = roomInventory.Quantity ?? 0;
            if (quantity > currentQuantity)
            {
                return BadRequest("So luong bao hong vuot qua so luong vat tu hien co trong phong.");
            }

            var equipment = roomInventory.Equipment;
            if (equipment == null)
            {
                return BadRequest("Vat tu phong nay chua lien ket voi bang equipment.");
            }

            var unitPenalty = roomInventory.PriceIfLost ?? equipment.DefaultPriceIfLost;
            var totalPenalty = unitPenalty * quantity;
            string? imageUrl = null;

            if (imageFile != null)
            {
                var folder = $"home/broke/{Slugify(roomInventory.Room.RoomNumber)}";
                imageUrl = await _cloudinaryService.UploadImageAsync(imageFile, folder);

                if (string.IsNullOrWhiteSpace(imageUrl))
                {
                    return StatusCode(500, "Upload anh bao hong len Cloudinary that bai.");
                }
            }

            roomInventory.Quantity = currentQuantity - quantity;
            roomInventory.IsActive = (roomInventory.Quantity ?? 0) > 0;

            equipment.DamagedQuantity += quantity;
            equipment.InUseQuantity = Math.Max(0, equipment.InUseQuantity - quantity);
            equipment.InStockQuantity = CalculateInStockQuantity(
                equipment.TotalQuantity,
                equipment.InUseQuantity,
                equipment.DamagedQuantity,
                equipment.LiquidatedQuantity);
            equipment.UpdatedAt = DateTime.UtcNow;

            var issue = new LossAndDamage
            {
                RoomInventoryId = roomInventory.Id,
                Quantity = quantity,
                PenaltyAmount = totalPenalty,
                Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim(),
                CreatedAt = DateTime.UtcNow,
                ImageUrl = imageUrl
            };

            _context.LossAndDamages.Add(issue);
            await _context.SaveChangesAsync();

            return Ok(new ReportInventoryIssueResponseDTO
            {
                LossAndDamageId = issue.Id,
                RoomInventoryId = roomInventory.Id,
                EquipmentId = equipment.Id,
                RoomNumber = roomInventory.Room.RoomNumber,
                EquipmentName = equipment.Name,
                Quantity = quantity,
                UnitPenalty = unitPenalty,
                PenaltyAmount = totalPenalty,
                RemainingRoomQuantity = roomInventory.Quantity ?? 0,
                EquipmentDamagedQuantity = equipment.DamagedQuantity,
                EquipmentInUseQuantity = equipment.InUseQuantity,
                EquipmentInStockQuantity = equipment.InStockQuantity,
                ImageUrl = imageUrl
            });
        }

        private static HousekeepingShortageReportItemDTO? MapShortageNotification(Notification notification)
        {
            if (string.IsNullOrWhiteSpace(notification.Content))
            {
                return null;
            }

            try
            {
                var payload = JsonSerializer.Deserialize<InventoryShortageNotificationPayloadDTO>(notification.Content);
                if (payload == null)
                {
                    return null;
                }

                return new HousekeepingShortageReportItemDTO
                {
                    NotificationId = notification.Id,
                    RoomId = payload.RoomId,
                    RoomNumber = payload.RoomNumber,
                    EquipmentId = payload.EquipmentId,
                    EquipmentName = payload.EquipmentName,
                    EquipmentCode = payload.EquipmentCode,
                    RequestedQuantity = payload.RequestedQuantity,
                    AvailableQuantity = payload.AvailableQuantity,
                    ShortageQuantity = payload.ShortageQuantity,
                    Note = payload.Note,
                    CreatedAt = notification.CreatedAt
                };
            }
            catch (JsonException)
            {
                return null;
            }
        }

        private HousekeepingTaskItemDTO MapTaskItem(Room room, int? currentUserId, int? assignedUserId)
        {
            return new HousekeepingTaskItemDTO
            {
                RoomId = room.Id,
                RoomNumber = room.RoomNumber,
                Floor = room.Floor,
                RoomTypeId = room.RoomTypeId,
                RoomTypeName = room.RoomType?.Name ?? string.Empty,
                Status = room.Status ?? string.Empty,
                CleaningStatus = room.CleaningStatus ?? string.Empty,
                AssignedUserId = assignedUserId,
                IsAssignedToCurrentUser = currentUserId.HasValue && assignedUserId == currentUserId.Value,
                IsLockedByOther = assignedUserId.HasValue && (!currentUserId.HasValue || assignedUserId != currentUserId.Value),
                Priority = room.CleaningStatus == RoomCleaningStatuses.Dirty ? "High" :
                    room.CleaningStatus == RoomCleaningStatuses.InProgress ? "Working" : "Normal",
                TaskType = GetTaskType(room.CleaningStatus),
                InventoryCount = room.RoomInventory.Count,
                PreviewImageUrl = room.RoomType?.RoomImages
                    .Where(ri => !string.IsNullOrWhiteSpace(ri.ImageUrl))
                    .OrderByDescending(ri => ri.IsPrimary ?? false)
                    .Select(ri => ri.ImageUrl)
                    .FirstOrDefault(),
                LastCleaningUpdatedAt = room.LastCleaningUpdatedAt
            };
        }

        private HousekeepingTaskDetailDTO MapTaskDetail(Room room, int? currentUserId, int? assignedUserId)
        {
            return new HousekeepingTaskDetailDTO
            {
                RoomId = room.Id,
                RoomNumber = room.RoomNumber,
                Floor = room.Floor,
                RoomTypeName = room.RoomType?.Name ?? string.Empty,
                Status = room.Status ?? string.Empty,
                CleaningStatus = room.CleaningStatus ?? string.Empty,
                AssignedUserId = assignedUserId,
                IsAssignedToCurrentUser = currentUserId.HasValue && assignedUserId == currentUserId.Value,
                IsLockedByOther = assignedUserId.HasValue && (!currentUserId.HasValue || assignedUserId != currentUserId.Value),
                TaskType = GetTaskType(room.CleaningStatus),
                PreviewImageUrl = room.RoomType?.RoomImages
                    .Where(ri => !string.IsNullOrWhiteSpace(ri.ImageUrl))
                    .OrderByDescending(ri => ri.IsPrimary ?? false)
                    .Select(ri => ri.ImageUrl)
                    .FirstOrDefault(),
                LastCleaningUpdatedAt = room.LastCleaningUpdatedAt,
                Inventory = room.RoomInventory
                    .OrderBy(ri => ri.Equipment != null ? ri.Equipment.Name : ri.ItemType)
                    .Select(MapRoomInventory)
                    .ToList()
            };
        }

        private static RoomInventoryDTO MapRoomInventory(RoomInventory item)
        {
            return new RoomInventoryDTO
            {
                Id = item.Id,
                RoomId = item.RoomId ?? 0,
                EquipmentId = item.EquipmentId,
                EquipmentName = item.Equipment?.Name,
                EquipmentCode = item.Equipment?.ItemCode,
                Quantity = item.Quantity,
                PriceIfLost = item.PriceIfLost,
                ItemType = item.ItemType,
                Note = item.Note,
                IsActive = item.IsActive,
                RoomNumber = item.Room?.RoomNumber
            };
        }

        private static string GetTaskType(string? cleaningStatus)
        {
            return cleaningStatus == RoomCleaningStatuses.Pickup ? "Dọn nhẹ" :
                cleaningStatus == RoomCleaningStatuses.InProgress ? "Đang dọn" :
                cleaningStatus == RoomCleaningStatuses.Clean ? "Đã dọn" :
                "Dọn phòng";
        }

        private static int CalculateInStockQuantity(int totalQuantity, int inUseQuantity, int damagedQuantity, int liquidatedQuantity)
        {
            return Math.Max(0, totalQuantity - inUseQuantity - damagedQuantity - liquidatedQuantity);
        }

        private static string Slugify(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return "general";
            }

            var builder = new StringBuilder();
            foreach (var ch in value.Trim().ToLowerInvariant())
            {
                if (char.IsLetterOrDigit(ch))
                {
                    builder.Append(ch);
                }
                else if (builder.Length > 0 && builder[^1] != '-')
                {
                    builder.Append('-');
                }
            }

            var result = builder.ToString().Trim('-');
            return string.IsNullOrWhiteSpace(result) ? "general" : result;
        }

        private int? ResolveCurrentUserId()
        {
            if (Request.Headers.TryGetValue("X-User-Id", out var header) &&
                int.TryParse(header.ToString(), out var userId))
            {
                return userId;
            }

            return null;
        }

    }
}
