using backend.Data;
using backend.DTOs.Housekeeping;
using backend.DTOs.RoomInventory;
using backend.Models;
using FluentValidation;
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
        //private readonly IValidator<CreateRoomInventoryDTO> _createValidator;
        //private readonly IValidator<UpdateRoomInventoryDTO> _updateValidator;
        //private readonly IValidator<CloneRoomInventoryDTO> _cloneValidator;

        public RoomInventoriesController(
            AppDbContext context
            //IValidator<CreateRoomInventoryDTO> createValidator,
            //IValidator<UpdateRoomInventoryDTO> updateValidator,
            //IValidator<CloneRoomInventoryDTO> cloneValidator
            )
        {
            _context = context;
            //_createValidator = createValidator;
            //_updateValidator = updateValidator;
            //_cloneValidator = cloneValidator;
        }

        private async Task<Equipment?> ResolveEquipmentAsync(int? equipmentId, string? itemName, decimal? priceIfLost)
        {
            if (equipmentId.HasValue)
            {
                return await _context.Equipments.FirstOrDefaultAsync(e => e.Id == equipmentId.Value && e.IsActive);
            }

            if (string.IsNullOrWhiteSpace(itemName))
            {
                return null;
            }

            var normalizedName = itemName.Trim();
            var equipment = await _context.Equipments.FirstOrDefaultAsync(e => e.Name == normalizedName);
            if (equipment != null)
            {
                return equipment;
            }

            var now = DateTime.UtcNow;
            equipment = new Equipment
            {
                ItemCode = $"EQ-{now:yyyyMMddHHmmssfff}",
                Name = normalizedName,
                Category = "General",
                Unit = "Item",
                TotalQuantity = 0,
                InUseQuantity = 0,
                DamagedQuantity = 0,
                LiquidatedQuantity = 0,
                InStockQuantity = 0,
                BasePrice = priceIfLost ?? 0,
                DefaultPriceIfLost = priceIfLost ?? 0,
                IsActive = true,
                CreatedAt = now
            };

            _context.Equipments.Add(equipment);
            await _context.SaveChangesAsync();
            return equipment;
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
            //var validation = await _createValidator.ValidateAsync(dto);
            //if (!validation.IsValid)
            //{
            //    return BadRequest(validation.Errors);
            //}

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
                    var shortageQuantity = Math.Max(0, dto.Quantity - availableQuantity);
                    var payload = new InventoryShortageNotificationPayloadDTO
                    {
                        RoomId = room.Id,
                        RoomNumber = room.RoomNumber,
                        EquipmentId = equipment.Id,
                        EquipmentName = equipment.Name,
                        EquipmentCode = equipment.ItemCode,
                        RequestedQuantity = dto.Quantity,
                        AvailableQuantity = availableQuantity,
                        ShortageQuantity = shortageQuantity,
                        Note = string.IsNullOrWhiteSpace(dto.Note) ? null : dto.Note.Trim()
                    };

                    _context.Notifications.Add(new Notification
                    {
                        Title = $"Thieu vat tu phong {room.RoomNumber}",
                        Content = JsonSerializer.Serialize(payload),
                        Type = "InventoryShortage",
                        ReferenceLink = $"/housekeeping/inventory?tab=shortage&roomId={room.Id}",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    });

                    await _context.SaveChangesAsync();

                    return Conflict(new
                    {
                        message = "Ton kho khong du. Da chuyen thong tin qua tab thieu vat tu.",
                        roomId = room.Id,
                        roomNumber = room.RoomNumber,
                        equipmentId = equipment.Id,
                        equipmentName = equipment.Name,
                        requestedQuantity = dto.Quantity,
                        availableQuantity,
                        shortageQuantity
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

            if (equipment != null)
            {
                equipment.InUseQuantity += dto.Quantity;
                equipment.InStockQuantity = CalculateInStockQuantity(
                    equipment.TotalQuantity,
                    equipment.InUseQuantity,
                    equipment.DamagedQuantity,
                    equipment.LiquidatedQuantity);
                equipment.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            var created = await _context.RoomInventory
                .Include(ri => ri.Room)
                .Include(ri => ri.Equipment)
                .AsNoTracking()
                .FirstAsync(ri => ri.Id == entity.Id);

            return CreatedAtAction(nameof(GetByRoom), new { roomId = dto.RoomId }, MapRoomInventory(created));
        }

        private static int GetAvailableStock(Equipment equipment)
        {
            return Math.Max(0, equipment.InStockQuantity ?? CalculateInStockQuantity(
                equipment.TotalQuantity,
                equipment.InUseQuantity,
                equipment.DamagedQuantity,
                equipment.LiquidatedQuantity));
        }

        private static int CalculateInStockQuantity(int totalQuantity, int inUseQuantity, int damagedQuantity, int liquidatedQuantity)
        {
            return Math.Max(0, totalQuantity - inUseQuantity - damagedQuantity - liquidatedQuantity);
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

            //var validation = await _updateValidator.ValidateAsync(dto);
            //if (!validation.IsValid)
            //{
            //    return BadRequest(validation.Errors);
            //}

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
                item.Quantity = dto.Quantity.Value;
            if (dto.PriceIfLost.HasValue)
                item.PriceIfLost = dto.PriceIfLost.Value;
            if (dto.ItemType != null)
                item.ItemType = string.IsNullOrWhiteSpace(dto.ItemType) ? null : dto.ItemType.Trim();
            if (dto.Note != null)
                item.Note = dto.Note;
            if (dto.IsActive.HasValue)
                item.IsActive = dto.IsActive.Value;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.RoomInventory
                .Include(ri => ri.Room)
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

            _context.RoomInventory.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("clone")]
        public async Task<ActionResult<RoomInventoryDTO>> Clone([FromBody] CloneRoomInventoryDTO dto)
        {
            //var validation = await _cloneValidator.ValidateAsync(dto);
            //if (!validation.IsValid)
            //{
            //    return BadRequest(validation.Errors);
            //}

            var source = await _context.RoomInventory
                .Include(ri => ri.Equipment)
                .AsNoTracking()
                .FirstOrDefaultAsync(ri => ri.Id == dto.SourceInventoryId);

            if (source == null)
            {
                return NotFound("Khong tim thay vat dung nguon.");
            }

            if (!source.RoomId.HasValue)
            {
                return BadRequest("Vat dung nguon chua gan voi phong.");
            }

            var targetRoomId = dto.TargetRoomId ?? source.RoomId.Value;
            var finalQuantity = dto.NewQuantity ?? source.Quantity ?? 0;
            var finalEquipmentId = dto.NewEquipmentId ?? source.EquipmentId;
            var finalItemType = dto.NewItemType ?? source.ItemType;
            var finalNote = dto.NewNote ?? source.Note;

            if (finalEquipmentId.HasValue)
            {
                var equipmentExists = await _context.Equipments
                    .AsNoTracking()
                    .AnyAsync(e => e.Id == finalEquipmentId.Value && e.IsActive);

                if (!equipmentExists)
                {
                    return BadRequest("Equipment khong ton tai hoac da ngung su dung.");
                }
            }

            var clone = new RoomInventory
            {
                RoomId = targetRoomId,
                EquipmentId = finalEquipmentId,
                Quantity = finalQuantity,
                PriceIfLost = source.PriceIfLost,
                ItemType = finalItemType,
                Note = finalNote,
                IsActive = source.IsActive
            };

            _context.RoomInventory.Add(clone);
            await _context.SaveChangesAsync();

            var created = await _context.RoomInventory
                .Include(ri => ri.Room)
                .Include(ri => ri.Equipment)
                .AsNoTracking()
                .FirstAsync(ri => ri.Id == clone.Id);

            return CreatedAtAction(nameof(GetByRoom), new { roomId = targetRoomId }, MapRoomInventory(created));
        }
    }
}
