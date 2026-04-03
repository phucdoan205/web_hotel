using backend.Common;
using backend.Data;
using backend.DTOs.Housekeeping;
using backend.DTOs.RoomInventory;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HousekeepingController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly CloudinaryService _cloudinaryService;

        public HousekeepingController(AppDbContext context, CloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        [HttpGet("tasks")]
        public async Task<ActionResult<HousekeepingTaskListResponseDTO>> GetTasks(
            [FromQuery] string? search = null,
            [FromQuery] string? status = null)
        {
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

            var items = rooms.Select(MapTaskItem).ToList();

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

            return Ok(new HousekeepingTaskDetailDTO
            {
                RoomId = room.Id,
                RoomNumber = room.RoomNumber,
                Floor = room.Floor,
                RoomTypeName = room.RoomType?.Name ?? string.Empty,
                Status = room.Status ?? string.Empty,
                CleaningStatus = room.CleaningStatus ?? string.Empty,
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
            });
        }

        [HttpPost("tasks/{roomId:int}/accept")]
        public async Task<ActionResult<HousekeepingTaskDetailDTO>> AcceptTask(int roomId)
        {
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

            if (room.CleaningStatus == RoomCleaningStatuses.InProgress)
            {
                return BadRequest("Phong nay da duoc nhan va dang don.");
            }

            if (room.CleaningStatus != RoomCleaningStatuses.Dirty &&
                room.CleaningStatus != RoomCleaningStatuses.Pickup)
            {
                return BadRequest("Chi co the nhan phong dang ban hoac can don nhe.");
            }

            room.CleaningStatus = RoomCleaningStatuses.InProgress;
            room.Status = RoomStatuses.Cleaning;
            room.LastCleaningUpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new HousekeepingTaskDetailDTO
            {
                RoomId = room.Id,
                RoomNumber = room.RoomNumber,
                Floor = room.Floor,
                RoomTypeName = room.RoomType?.Name ?? string.Empty,
                Status = room.Status ?? string.Empty,
                CleaningStatus = room.CleaningStatus ?? string.Empty,
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
            });
        }

        [HttpPost("tasks/{roomId:int}/complete")]
        public async Task<IActionResult> CompleteTask(int roomId)
        {
            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.Id == roomId);
            if (room == null)
            {
                return NotFound("Khong tim thay phong.");
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
            return NoContent();
        }

        [HttpPost("inventory-issues")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(20_000_000)]
        public async Task<ActionResult<ReportInventoryIssueResponseDTO>> ReportInventoryIssue([FromForm] ReportInventoryIssueRequestDTO request)
        {
            if (request.Quantity <= 0)
            {
                return BadRequest("So luong hu hong phai lon hon 0.");
            }

            var roomInventory = await _context.RoomInventory
                .Include(ri => ri.Room)
                .Include(ri => ri.Equipment)
                .FirstOrDefaultAsync(ri => ri.Id == request.RoomInventoryId);

            if (roomInventory == null || roomInventory.Room == null)
            {
                return NotFound("Khong tim thay vat tu phong.");
            }

            var currentQuantity = roomInventory.Quantity ?? 0;
            if (request.Quantity > currentQuantity)
            {
                return BadRequest("So luong bao hong vuot qua so luong vat tu hien co trong phong.");
            }

            var equipment = roomInventory.Equipment;
            if (equipment == null)
            {
                return BadRequest("Vat tu phong nay chua lien ket voi bang equipment.");
            }

            var unitPenalty = roomInventory.PriceIfLost ?? equipment.DefaultPriceIfLost;
            var totalPenalty = unitPenalty * request.Quantity;
            string? imageUrl = null;

            if (request.ImageFile != null)
            {
                var folder = $"home/broke/{Slugify(roomInventory.Room.RoomNumber)}";
                imageUrl = await _cloudinaryService.UploadImageAsync(request.ImageFile, folder);

                if (string.IsNullOrWhiteSpace(imageUrl))
                {
                    return StatusCode(500, "Upload anh bao hong len Cloudinary that bai.");
                }
            }

            roomInventory.Quantity = currentQuantity - request.Quantity;
            roomInventory.IsActive = (roomInventory.Quantity ?? 0) > 0;

            equipment.DamagedQuantity += request.Quantity;
            equipment.InUseQuantity = Math.Max(0, equipment.InUseQuantity - request.Quantity);
            equipment.InStockQuantity = CalculateInStockQuantity(
                equipment.TotalQuantity,
                equipment.InUseQuantity,
                equipment.DamagedQuantity,
                equipment.LiquidatedQuantity);
            equipment.UpdatedAt = DateTime.UtcNow;

            var issue = new LossAndDamage
            {
                RoomInventoryId = roomInventory.Id,
                Quantity = request.Quantity,
                PenaltyAmount = totalPenalty,
                Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
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
                Quantity = request.Quantity,
                UnitPenalty = unitPenalty,
                PenaltyAmount = totalPenalty,
                RemainingRoomQuantity = roomInventory.Quantity ?? 0,
                EquipmentDamagedQuantity = equipment.DamagedQuantity,
                EquipmentInUseQuantity = equipment.InUseQuantity,
                EquipmentInStockQuantity = equipment.InStockQuantity,
                ImageUrl = imageUrl
            });
        }

        private static HousekeepingTaskItemDTO MapTaskItem(Room room)
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
    }
}
