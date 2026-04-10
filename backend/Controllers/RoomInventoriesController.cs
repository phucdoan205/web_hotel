using backend.Data;
using backend.DTOs.Housekeeping;
using backend.DTOs.RoomInventory;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomInventoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoomInventoriesController(AppDbContext context)
        {
            _context = context;
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

        [HttpGet("room/{roomId:int}")]
        public async Task<ActionResult<List<RoomInventoryDTO>>> GetByRoom(int roomId)
        {
            var roomExists = await _context.Rooms
                .AsNoTracking()
                .AnyAsync(r => r.Id == roomId && !r.IsDeleted);

            if (!roomExists)
            {
                return NotFound("Khong tim thay phong.");
            }

            var items = await _context.RoomInventory
                .Include(ri => ri.Room)
                .Include(ri => ri.Equipment)
                .Where(ri => ri.RoomId == roomId && ri.Room != null && !ri.Room.IsDeleted)
                .AsNoTracking()
                .OrderBy(ri => ri.Equipment != null ? ri.Equipment.Name : ri.ItemType)
                .ToListAsync();

            return Ok(items.Select(MapRoomInventory).ToList());
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRoomInventoryDTO dto)
        {
            Equipment? equipment = null;
            Room? room = null;

            if (dto.EquipmentId.HasValue)
            {
                equipment = await _context.Equipments
                    .FirstOrDefaultAsync(e => e.Id == dto.EquipmentId.Value && e.IsActive);

                if (equipment == null)
                {
                    return BadRequest("Equipment khong ton tai hoac da ngung su dung.");
                }

                room = await _context.Rooms
                    .AsNoTracking()
                    .FirstOrDefaultAsync(r => r.Id == dto.RoomId && !r.IsDeleted);

                if (room == null)
                {
                    return BadRequest("Khong tim thay phong.");
                }

                var availableQuantity = GetAvailableStock(equipment);
                if (dto.Quantity > availableQuantity)
                {
                    return Conflict(new
                    {
                        message = "Ton kho khong du, khong the them vat tu vao phong.",
                        roomId = room.Id,
                        roomNumber = room.RoomNumber,
                        equipmentId = equipment.Id,
                        equipmentName = equipment.Name,
                        requestedQuantity = dto.Quantity,
                        availableQuantity,
                        shortageQuantity = Math.Max(0, dto.Quantity - availableQuantity)
                    });
                }
            }

            var entity = new RoomInventory
            {
                RoomId = dto.RoomId,
                EquipmentId = dto.EquipmentId,
                Quantity = dto.Quantity,
                PriceIfLost = dto.PriceIfLost,
                ItemType = string.IsNullOrWhiteSpace(dto.ItemType) ? null : dto.ItemType.Trim(),
                Note = dto.Note,
                IsActive = dto.IsActive
            };

            _context.RoomInventory.Add(entity);

            await _context.SaveChangesAsync();

            if (equipment != null)
            {
                await RecalculateEquipmentUsageAsync(equipment.Id);
                await _context.SaveChangesAsync();
            }

            var created = await _context.RoomInventory
                .Include(ri => ri.Room)
                .Include(ri => ri.Equipment)
                .AsNoTracking()
                .FirstAsync(ri => ri.Id == entity.Id);

            return CreatedAtAction(nameof(GetByRoom), new { roomId = dto.RoomId }, MapRoomInventory(created));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRoomInventoryDTO dto)
        {
            var item = await _context.RoomInventory
                .Include(ri => ri.Room)
                .Include(ri => ri.Equipment)
                .FirstOrDefaultAsync(ri => ri.Id == id);

            if (item == null)
            {
                return NotFound();
            }

            if (item.Room == null || item.Room.IsDeleted)
            {
                return BadRequest("Phong da bi xoa hoac khong ton tai.");
            }

            var previousEquipmentId = item.EquipmentId;

            if (dto.EquipmentId.HasValue)
            {
                var equipmentExists = await _context.Equipments
                    .AsNoTracking()
                    .AnyAsync(e => e.Id == dto.EquipmentId.Value && e.IsActive);

                if (!equipmentExists)
                {
                    return BadRequest("Equipment khong ton tai hoac da ngung su dung.");
                }

                item.EquipmentId = dto.EquipmentId.Value;
            }

            if (dto.Quantity.HasValue)
            {
                if (item.Equipment != null)
                {
                    var oldQuantity = item.Quantity ?? 0;
                    var nextQuantity = dto.Quantity.Value;
                    var delta = nextQuantity - oldQuantity;

                    if (delta > 0)
                    {
                        var availableStock = GetAvailableStock(item.Equipment);
                        if (delta > availableStock)
                        {
                            return Conflict(new
                            {
                                message = "Ton kho khong du de cap nhat so luong vat tu.",
                                equipmentId = item.Equipment.Id,
                                equipmentName = item.Equipment.Name,
                                requestedQuantity = nextQuantity,
                                availableQuantity = availableStock + oldQuantity,
                                shortageQuantity = delta - availableStock
                            });
                        }
                    }
                }

                item.Quantity = dto.Quantity.Value;
            }

            if (dto.PriceIfLost.HasValue)
            {
                item.PriceIfLost = dto.PriceIfLost.Value;
            }

            if (dto.ItemType != null)
            {
                item.ItemType = string.IsNullOrWhiteSpace(dto.ItemType) ? null : dto.ItemType.Trim();
            }

            if (dto.Note != null)
            {
                item.Note = dto.Note;
            }

            if (dto.IsActive.HasValue)
            {
                item.IsActive = dto.IsActive.Value;
            }

            await _context.SaveChangesAsync();

            if (previousEquipmentId.HasValue)
            {
                await RecalculateEquipmentUsageAsync(previousEquipmentId.Value);
            }

            if (item.EquipmentId.HasValue && item.EquipmentId != previousEquipmentId)
            {
                await RecalculateEquipmentUsageAsync(item.EquipmentId.Value);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.RoomInventory
                .Include(ri => ri.Room)
                .Include(ri => ri.Equipment)
                .FirstOrDefaultAsync(ri => ri.Id == id);

            if (item == null)
            {
                return NotFound();
            }

            if (item.Room == null || item.Room.IsDeleted)
            {
                return BadRequest("Phong da bi xoa hoac khong ton tai.");
            }

            var hasDamage = await _context.LossAndDamages
                .AnyAsync(ld => ld.RoomInventoryId == id);

            if (hasDamage)
            {
                return BadRequest("Khong the xoa vat dung dang co ghi nhan mat mat hu hong.");
            }

            var equipmentId = item.EquipmentId;

            _context.RoomInventory.Remove(item);
            await _context.SaveChangesAsync();

            if (equipmentId.HasValue)
            {
                await RecalculateEquipmentUsageAsync(equipmentId.Value);
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }

        [HttpPost("clone")]
        public async Task<ActionResult<CloneRoomInventoryResponseDTO>> Clone([FromBody] CloneRoomInventoryDTO dto)
        {
            if (dto.SourceRoomId.HasValue)
            {
                return await CloneFromRoomAsync(dto);
            }

            if (!dto.SourceInventoryId.HasValue)
            {
                return BadRequest("Can cung cap SourceInventoryId hoac SourceRoomId.");
            }

            return await CloneSingleInventoryAsync(dto);
        }

        private async Task<ActionResult<CloneRoomInventoryResponseDTO>> CloneSingleInventoryAsync(CloneRoomInventoryDTO dto)
        {
            var source = await _context.RoomInventory
                .Include(ri => ri.Equipment)
                .Include(ri => ri.Room)
                .FirstOrDefaultAsync(ri => ri.Id == dto.SourceInventoryId!.Value);

            if (source == null)
            {
                return NotFound("Khong tim thay vat dung nguon.");
            }

            if (!source.RoomId.HasValue)
            {
                return BadRequest("Vat dung nguon chua gan voi phong.");
            }

            var targetRoomId = dto.TargetRoomId ?? source.RoomId.Value;
            var targetRoom = await _context.Rooms.FirstOrDefaultAsync(r => r.Id == targetRoomId && !r.IsDeleted);
            if (targetRoom == null)
            {
                return BadRequest("Phong dich khong ton tai.");
            }

            var finalQuantity = dto.NewQuantity ?? source.Quantity ?? 0;
            var finalEquipmentId = dto.NewEquipmentId ?? source.EquipmentId;
            var finalItemType = string.IsNullOrWhiteSpace(dto.NewItemType) ? source.ItemType : dto.NewItemType.Trim();
            var finalNote = dto.NewNote ?? source.Note;

            if (finalQuantity <= 0)
            {
                return BadRequest("So luong clone phai lon hon 0.");
            }

            var shortageDetails = new List<InventoryShortageDetailDTO>();

            if (finalEquipmentId.HasValue)
            {
                var equipment = await _context.Equipments.FirstOrDefaultAsync(e => e.Id == finalEquipmentId.Value && e.IsActive);
                if (equipment == null)
                {
                    return BadRequest("Equipment khong ton tai hoac da ngung su dung.");
                }

                var availableStock = GetAvailableStock(equipment);
                var quantityToAssign = Math.Min(finalQuantity, availableStock);
                var shortageQuantity = Math.Max(0, finalQuantity - quantityToAssign);

                if (quantityToAssign > 0)
                {
                    await UpsertRoomInventoryAsync(
                        targetRoom.Id,
                        finalEquipmentId,
                        finalItemType,
                        quantityToAssign,
                        source.PriceIfLost,
                        finalNote,
                        source.IsActive);

                    equipment.InUseQuantity += quantityToAssign;
                    equipment.InStockQuantity = CalculateInStockQuantity(
                        equipment.TotalQuantity,
                        equipment.InUseQuantity,
                        equipment.DamagedQuantity,
                        equipment.LiquidatedQuantity);
                    equipment.UpdatedAt = DateTime.UtcNow;
                }

                if (shortageQuantity > 0)
                {
                    shortageDetails.Add(new InventoryShortageDetailDTO
                    {
                        EquipmentId = equipment.Id,
                        EquipmentName = equipment.Name,
                        EquipmentCode = equipment.ItemCode,
                        RequestedQuantity = finalQuantity,
                        AvailableQuantity = availableStock,
                        ShortageQuantity = shortageQuantity,
                        Note = finalNote
                    });
                }
            }
            else
            {
                await UpsertRoomInventoryAsync(
                    targetRoom.Id,
                    null,
                    finalItemType,
                    finalQuantity,
                    source.PriceIfLost,
                    finalNote,
                    source.IsActive);
            }

            Notification? shortageNotification = null;
            if (shortageDetails.Count > 0)
            {
                shortageNotification = BuildShortageNotification(
                    targetRoom,
                    "CloneRoomInventory",
                    shortageDetails,
                    source.Room);

                _context.Notifications.Add(shortageNotification);
            }

            await _context.SaveChangesAsync();

            return Ok(new CloneRoomInventoryResponseDTO
            {
                TargetRoomId = targetRoom.Id,
                TargetRoomNumber = targetRoom.RoomNumber,
                ClonedItemCount = finalQuantity - shortageDetails.Sum(item => item.ShortageQuantity),
                ShortageItemCount = shortageDetails.Count,
                ShortageNotificationId = shortageNotification?.Id,
                ShortageDetails = shortageDetails,
                Message = shortageDetails.Count > 0
                    ? "Da clone mot phan vat tu. Phan con thieu da duoc tao bao cao sang Housekeeping."
                    : "Da clone vat tu sang phong dich."
            });
        }

        private async Task<ActionResult<CloneRoomInventoryResponseDTO>> CloneFromRoomAsync(CloneRoomInventoryDTO dto)
        {
            if (!dto.SourceRoomId.HasValue)
            {
                return BadRequest("Can cung cap phong nguon.");
            }

            if (!dto.TargetRoomId.HasValue)
            {
                return BadRequest("Can chon phong dich de clone vat tu.");
            }

            if (dto.SourceRoomId.Value == dto.TargetRoomId.Value)
            {
                return BadRequest("Phong nguon va phong dich khong duoc trung nhau.");
            }

            var sourceRoom = await _context.Rooms
                .Include(room => room.RoomInventory)
                    .ThenInclude(item => item.Equipment)
                .FirstOrDefaultAsync(room => room.Id == dto.SourceRoomId.Value && !room.IsDeleted);

            if (sourceRoom == null)
            {
                return NotFound("Khong tim thay phong nguon.");
            }

            var targetRoom = await _context.Rooms
                .FirstOrDefaultAsync(room => room.Id == dto.TargetRoomId.Value && !room.IsDeleted);

            if (targetRoom == null)
            {
                return NotFound("Khong tim thay phong dich.");
            }

            var sourceItems = sourceRoom.RoomInventory
                .Where(item => (item.Quantity ?? 0) > 0)
                .OrderBy(item => item.Equipment != null ? item.Equipment.Name : item.ItemType)
                .ToList();

            if (sourceItems.Count == 0)
            {
                return BadRequest("Phong nguon khong co vat tu de clone.");
            }

            var shortageDetails = new List<InventoryShortageDetailDTO>();
            var clonedItemCount = 0;

            foreach (var sourceItem in sourceItems)
            {
                var requestedQuantity = sourceItem.Quantity ?? 0;
                if (requestedQuantity <= 0)
                {
                    continue;
                }

                var itemType = string.IsNullOrWhiteSpace(sourceItem.ItemType)
                    ? sourceItem.Equipment?.Name
                    : sourceItem.ItemType!.Trim();

                if (sourceItem.EquipmentId.HasValue)
                {
                    var equipment = await _context.Equipments.FirstOrDefaultAsync(e => e.Id == sourceItem.EquipmentId.Value && e.IsActive);
                    if (equipment == null)
                    {
                        shortageDetails.Add(new InventoryShortageDetailDTO
                        {
                            EquipmentId = sourceItem.EquipmentId,
                            EquipmentName = sourceItem.Equipment?.Name ?? itemType ?? "Vat tu",
                            EquipmentCode = sourceItem.Equipment?.ItemCode,
                            RequestedQuantity = requestedQuantity,
                            AvailableQuantity = 0,
                            ShortageQuantity = requestedQuantity,
                            Note = sourceItem.Note
                        });
                        continue;
                    }

                    var availableStock = GetAvailableStock(equipment);
                    var quantityToAssign = Math.Min(requestedQuantity, availableStock);
                    var shortageQuantity = Math.Max(0, requestedQuantity - quantityToAssign);

                    if (quantityToAssign > 0)
                    {
                        await UpsertRoomInventoryAsync(
                            targetRoom.Id,
                            equipment.Id,
                            itemType,
                            quantityToAssign,
                            sourceItem.PriceIfLost,
                            sourceItem.Note,
                            sourceItem.IsActive);

                        equipment.InUseQuantity += quantityToAssign;
                        equipment.InStockQuantity = CalculateInStockQuantity(
                            equipment.TotalQuantity,
                            equipment.InUseQuantity,
                            equipment.DamagedQuantity,
                            equipment.LiquidatedQuantity);
                        equipment.UpdatedAt = DateTime.UtcNow;
                        clonedItemCount += 1;
                    }

                    if (shortageQuantity > 0)
                    {
                        shortageDetails.Add(new InventoryShortageDetailDTO
                        {
                            EquipmentId = equipment.Id,
                            EquipmentName = equipment.Name,
                            EquipmentCode = equipment.ItemCode,
                            RequestedQuantity = requestedQuantity,
                            AvailableQuantity = availableStock,
                            ShortageQuantity = shortageQuantity,
                            Note = sourceItem.Note
                        });
                    }
                }
                else
                {
                    await UpsertRoomInventoryAsync(
                        targetRoom.Id,
                        null,
                        itemType,
                        requestedQuantity,
                        sourceItem.PriceIfLost,
                        sourceItem.Note,
                        sourceItem.IsActive);
                    clonedItemCount += 1;
                }
            }

            Notification? shortageNotification = null;
            if (shortageDetails.Count > 0)
            {
                shortageNotification = BuildShortageNotification(
                    targetRoom,
                    "CloneRoom",
                    shortageDetails,
                    sourceRoom);

                _context.Notifications.Add(shortageNotification);
            }

            await _context.SaveChangesAsync();

            return Ok(new CloneRoomInventoryResponseDTO
            {
                TargetRoomId = targetRoom.Id,
                TargetRoomNumber = targetRoom.RoomNumber,
                ClonedItemCount = clonedItemCount,
                ShortageItemCount = shortageDetails.Count,
                ShortageNotificationId = shortageNotification?.Id,
                ShortageDetails = shortageDetails,
                Message = shortageDetails.Count > 0
                    ? $"Da clone duoc {clonedItemCount} vat tu. Cac vat tu con thieu da duoc gui sang Housekeeping."
                    : $"Da clone toan bo {clonedItemCount} vat tu tu phong {sourceRoom.RoomNumber}."
            });
        }

        private async Task UpsertRoomInventoryAsync(
            int targetRoomId,
            int? equipmentId,
            string? itemType,
            int quantity,
            decimal? priceIfLost,
            string? note,
            bool isActive)
        {
            if (quantity <= 0)
            {
                return;
            }

            var normalizedItemType = string.IsNullOrWhiteSpace(itemType)
                ? null
                : itemType.Trim();

            var existing = await _context.RoomInventory.FirstOrDefaultAsync(item =>
                item.RoomId == targetRoomId &&
                ((equipmentId.HasValue && item.EquipmentId == equipmentId.Value) ||
                 (!equipmentId.HasValue &&
                  item.EquipmentId == null &&
                  item.ItemType != null &&
                  normalizedItemType != null &&
                  item.ItemType.ToLower() == normalizedItemType.ToLower())));

            if (existing == null)
            {
                _context.RoomInventory.Add(new RoomInventory
                {
                    RoomId = targetRoomId,
                    EquipmentId = equipmentId,
                    Quantity = quantity,
                    PriceIfLost = priceIfLost,
                    ItemType = normalizedItemType,
                    Note = note,
                    IsActive = isActive
                });

                return;
            }

            existing.Quantity = (existing.Quantity ?? 0) + quantity;
            existing.PriceIfLost = priceIfLost;
            existing.Note = note;
            existing.IsActive = true;

            if (!string.IsNullOrWhiteSpace(normalizedItemType))
            {
                existing.ItemType = normalizedItemType;
            }
        }

        private static Notification BuildShortageNotification(
            Room targetRoom,
            string reason,
            List<InventoryShortageDetailDTO> shortageDetails,
            Room? sourceRoom)
        {
            var firstItem = shortageDetails[0];
            var payload = new InventoryShortageNotificationPayloadDTO
            {
                Reason = reason,
                RoomId = targetRoom.Id,
                RoomNumber = targetRoom.RoomNumber,
                SourceRoomId = sourceRoom?.Id,
                SourceRoomNumber = sourceRoom?.RoomNumber,
                EquipmentId = shortageDetails.Count == 1 ? firstItem.EquipmentId : null,
                EquipmentName = shortageDetails.Count == 1 ? firstItem.EquipmentName : $"{shortageDetails.Count} vat tu",
                EquipmentCode = shortageDetails.Count == 1 ? firstItem.EquipmentCode : null,
                RequestedQuantity = shortageDetails.Sum(item => item.RequestedQuantity),
                AvailableQuantity = shortageDetails.Sum(item => item.AvailableQuantity),
                ShortageQuantity = shortageDetails.Sum(item => item.ShortageQuantity),
                Note = shortageDetails.Count == 1 ? firstItem.Note : $"Thieu vat tu khi clone vao phong {targetRoom.RoomNumber}.",
                Items = shortageDetails
            };

            var title = reason == "CloneRoom" || reason == "CloneRoomInventory"
                ? $"Thieu vat tu khi clone vao phong {targetRoom.RoomNumber}"
                : $"Thieu vat tu phong {targetRoom.RoomNumber}";

            return new Notification
            {
                Title = title,
                Content = JsonSerializer.Serialize(payload),
                Type = "InventoryShortage",
                ReferenceLink = $"/housekeeping/inventory?tab=shortage&roomId={targetRoom.Id}",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
        }

        private static int GetAvailableStock(Equipment equipment)
        {
            return Math.Max(0, equipment.InStockQuantity ?? CalculateInStockQuantity(
                equipment.TotalQuantity,
                equipment.InUseQuantity,
                equipment.DamagedQuantity,
                equipment.LiquidatedQuantity));
        }

        private async Task RecalculateEquipmentUsageAsync(int equipmentId)
        {
            var equipment = await _context.Equipments.FirstOrDefaultAsync(e => e.Id == equipmentId);
            if (equipment == null)
            {
                return;
            }

            var inUseQuantity = await _context.RoomInventory
                .Where(item => item.EquipmentId == equipmentId)
                .SumAsync(item => item.Quantity ?? 0);

            equipment.InUseQuantity = Math.Max(0, inUseQuantity);
            equipment.InStockQuantity = CalculateInStockQuantity(
                equipment.TotalQuantity,
                equipment.InUseQuantity,
                equipment.DamagedQuantity,
                equipment.LiquidatedQuantity);
            equipment.UpdatedAt = DateTime.UtcNow;
        }

        private static int CalculateInStockQuantity(int totalQuantity, int inUseQuantity, int damagedQuantity, int liquidatedQuantity)
        {
            return Math.Max(0, totalQuantity - inUseQuantity - damagedQuantity - liquidatedQuantity);
        }
    }
}
