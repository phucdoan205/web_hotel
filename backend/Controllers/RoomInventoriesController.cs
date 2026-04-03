using backend.Data;
using backend.DTOs.RoomInventory;
using backend.Models;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
                EquipmentCode = item.Equipment?.ItemCode,
                EquipmentName = item.Equipment?.Name,
                ItemName = item.Equipment?.Name ?? string.Empty,
                Quantity = item.Quantity,
                PriceIfLost = item.PriceIfLost,
                Note = item.Note,
                IsActive = item.IsActive,
                ItemType = item.ItemType,
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
                .OrderBy(ri => ri.Equipment != null ? ri.Equipment.Name : string.Empty)
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

            var equipment = await ResolveEquipmentAsync(dto.EquipmentId, dto.ItemName, dto.PriceIfLost);
            if (equipment == null)
            {
                return BadRequest("Vui long chon EquipmentId hoac nhap ItemName.");
            }

            var entity = new RoomInventory
            {
                RoomId = dto.RoomId,
                EquipmentId = equipment.Id,
                Quantity = dto.Quantity,
                PriceIfLost = dto.PriceIfLost ?? equipment.DefaultPriceIfLost,
                Note = dto.Note,
                IsActive = dto.IsActive ?? true,
                ItemType = dto.ItemType
            };

            _context.RoomInventory.Add(entity);
            await _context.SaveChangesAsync();

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

            //var validation = await _updateValidator.ValidateAsync(dto);
            //if (!validation.IsValid)
            //{
            //    return BadRequest(validation.Errors);
            //}

            if (dto.EquipmentId.HasValue || !string.IsNullOrWhiteSpace(dto.ItemName))
            {
                var equipment = await ResolveEquipmentAsync(dto.EquipmentId, dto.ItemName, dto.PriceIfLost ?? item.PriceIfLost);
                if (equipment == null)
                {
                    return BadRequest("Khong tim thay thiet bi.");
                }

                var duplicated = await _context.RoomInventory.AnyAsync(ri =>
                    ri.Id != id &&
                    ri.RoomId == item.RoomId &&
                    ri.EquipmentId == equipment.Id);

                if (duplicated)
                {
                    return BadRequest("Vat dung nay da ton tai trong phong.");
                }

                item.EquipmentId = equipment.Id;
            }

            if (dto.Quantity.HasValue)
                item.Quantity = dto.Quantity.Value;
            if (dto.PriceIfLost.HasValue)
                item.PriceIfLost = dto.PriceIfLost.Value;
            if (dto.Note != null)
                item.Note = dto.Note;
            if (dto.IsActive.HasValue)
                item.IsActive = dto.IsActive.Value;
            if (dto.ItemType != null)
                item.ItemType = dto.ItemType;

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
            var finalItemName = string.IsNullOrWhiteSpace(dto.NewItemName)
                ? source.Equipment?.Name
                : dto.NewItemName.Trim();
            var finalQuantity = dto.NewQuantity ?? source.Quantity ?? 0;
            var equipment = await ResolveEquipmentAsync(dto.NewEquipmentId ?? source.EquipmentId, finalItemName, source.PriceIfLost);
            if (equipment == null)
            {
                return BadRequest("Khong tim thay equipment nguon.");
            }

            var clone = new RoomInventory
            {
                RoomId = targetRoomId,
                EquipmentId = equipment.Id,
                Quantity = finalQuantity,
                PriceIfLost = source.PriceIfLost ?? equipment.DefaultPriceIfLost,
                Note = source.Note,
                IsActive = source.IsActive,
                ItemType = source.ItemType
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
