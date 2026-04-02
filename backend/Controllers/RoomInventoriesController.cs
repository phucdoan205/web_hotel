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

        private static RoomInventoryDTO MapRoomInventory(RoomInventory item)
        {
            return new RoomInventoryDTO
            {
                Id = item.Id,
                RoomId = item.RoomId ?? 0,
                ItemName = item.ItemName,
                Quantity = item.Quantity,
                PriceIfLost = item.PriceIfLost,
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
                .Where(ri => ri.RoomId == roomId && ri.Room != null && !ri.Room.IsDeleted)
                .AsNoTracking()
                .OrderBy(ri => ri.ItemName)
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

            var entity = new RoomInventory
            {
                RoomId = dto.RoomId,
                ItemName = dto.ItemName.Trim(),
                Quantity = dto.Quantity,
                PriceIfLost = dto.PriceIfLost
            };

            _context.RoomInventory.Add(entity);
            await _context.SaveChangesAsync();

            var created = await _context.RoomInventory
                .Include(ri => ri.Room)
                .AsNoTracking()
                .FirstAsync(ri => ri.Id == entity.Id);

            return CreatedAtAction(nameof(GetByRoom), new { roomId = dto.RoomId }, MapRoomInventory(created));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRoomInventoryDTO dto)
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

            //var validation = await _updateValidator.ValidateAsync(dto);
            //if (!validation.IsValid)
            //{
            //    return BadRequest(validation.Errors);
            //}

            if (!string.IsNullOrWhiteSpace(dto.ItemName))
            {
                var newItemName = dto.ItemName.Trim();
                var duplicated = await _context.RoomInventory.AnyAsync(ri =>
                    ri.Id != id &&
                    ri.RoomId == item.RoomId &&
                    ri.ItemName == newItemName);

                if (duplicated)
                {
                    return BadRequest("Vat dung nay da ton tai trong phong.");
                }

                item.ItemName = newItemName;
            }

            if (dto.Quantity.HasValue)
                item.Quantity = dto.Quantity.Value;
            if (dto.PriceIfLost.HasValue)
                item.PriceIfLost = dto.PriceIfLost.Value;

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

        [HttpPost("bulk")]
        public async Task<IActionResult> BulkCreate([FromBody] List<CreateRoomInventoryDTO> items)
        {
            if (items == null || items.Count == 0)
            {
                return BadRequest("Danh sach vat tu trong.");
            }

            var roomIds = items
                .Select(x => x.RoomId)
                .Distinct()
                .ToList();

            var validRoomIds = await _context.Rooms
                .AsNoTracking()
                .Where(r => roomIds.Contains(r.Id) && !r.IsDeleted)
                .Select(r => r.Id)
                .ToListAsync();

            if (validRoomIds.Count != roomIds.Count)
            {
                return BadRequest("Co phong khong ton tai hoac da bi xoa.");
            }

            var existingItems = await _context.RoomInventory
                .Where(ri => ri.RoomId.HasValue && roomIds.Contains(ri.RoomId.Value))
                .ToListAsync();

            var byKey = existingItems.ToDictionary(
                ri => $"{ri.RoomId}:{ri.ItemName.Trim().ToLowerInvariant()}",
                ri => ri);

            var createdCount = 0;
            var updatedCount = 0;

            foreach (var dto in items)
            {
                if (string.IsNullOrWhiteSpace(dto.ItemName))
                {
                    continue;
                }

                var itemName = dto.ItemName.Trim();
                var key = $"{dto.RoomId}:{itemName.ToLowerInvariant()}";

                if (byKey.TryGetValue(key, out var existing))
                {
                    existing.Quantity = (existing.Quantity ?? 0) + dto.Quantity;
                    if ((existing.PriceIfLost ?? 0) == 0 && dto.PriceIfLost > 0)
                    {
                        existing.PriceIfLost = dto.PriceIfLost;
                    }
                    updatedCount++;
                    continue;
                }

                var entity = new RoomInventory
                {
                    RoomId = dto.RoomId,
                    ItemName = itemName,
                    Quantity = dto.Quantity,
                    PriceIfLost = dto.PriceIfLost
                };

                _context.RoomInventory.Add(entity);
                byKey[key] = entity;
                createdCount++;
            }

            await _context.SaveChangesAsync();

            return Ok(new { createdCount, updatedCount });
        }

        [HttpPost("clone")]
        public async Task<IActionResult> Clone([FromBody] CloneRoomInventoryDTO dto)
        {
            //var validation = await _cloneValidator.ValidateAsync(dto);
            //if (!validation.IsValid)
            //{
            //    return BadRequest(validation.Errors);
            //}

            if (dto.SourceRoomId.HasValue)
            {
                var sourceRoomId = dto.SourceRoomId.Value;
                var targetRoomIdValue = dto.TargetRoomId;

                if (!targetRoomIdValue.HasValue)
                {
                    return BadRequest("Can truyen TargetRoomId.");
                }

                var sourceRoomExists = await _context.Rooms
                    .AsNoTracking()
                    .AnyAsync(r => r.Id == sourceRoomId && !r.IsDeleted);

                if (!sourceRoomExists)
                {
                    return NotFound("Khong tim thay phong nguon.");
                }

                var targetRoomExists = await _context.Rooms
                    .AsNoTracking()
                    .AnyAsync(r => r.Id == targetRoomIdValue.Value && !r.IsDeleted);

                if (!targetRoomExists)
                {
                    return NotFound("Khong tim thay phong dich.");
                }

                var sourceItems = await _context.RoomInventory
                    .AsNoTracking()
                    .Where(ri => ri.RoomId == sourceRoomId)
                    .ToListAsync();

                var targetItems = await _context.RoomInventory
                    .Where(ri => ri.RoomId == targetRoomIdValue.Value)
                    .ToListAsync();

                var targetByName = targetItems.ToDictionary(
                    ri => ri.ItemName.Trim().ToLowerInvariant(),
                    ri => ri);

                var createdCount = 0;
                var updatedCount = 0;

                foreach (var src in sourceItems)
                {
                    var name = src.ItemName.Trim();
                    var key = name.ToLowerInvariant();
                    var qty = src.Quantity ?? 0;

                    if (targetByName.TryGetValue(key, out var existing))
                    {
                        existing.Quantity = (existing.Quantity ?? 0) + qty;
                        if ((existing.PriceIfLost ?? 0) == 0 && (src.PriceIfLost ?? 0) > 0)
                        {
                            existing.PriceIfLost = src.PriceIfLost;
                        }
                        updatedCount++;
                        continue;
                    }

                    var cloneEntity = new RoomInventory
                    {
                        RoomId = targetRoomIdValue.Value,
                        ItemName = name,
                        Quantity = qty,
                        PriceIfLost = src.PriceIfLost
                    };

                    _context.RoomInventory.Add(cloneEntity);
                    targetByName[key] = cloneEntity;
                    createdCount++;
                }

                await _context.SaveChangesAsync();
                return Ok(new { createdCount, updatedCount });
            }

            if (!dto.SourceInventoryId.HasValue || dto.SourceInventoryId.Value <= 0)
            {
                return BadRequest("Can truyen SourceInventoryId.");
            }

            var source = await _context.RoomInventory
                .AsNoTracking()
                .FirstOrDefaultAsync(ri => ri.Id == dto.SourceInventoryId.Value);

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
                ? source.ItemName
                : dto.NewItemName.Trim();
            var finalQuantity = dto.NewQuantity ?? source.Quantity ?? 0;

            var clone = new RoomInventory
            {
                RoomId = targetRoomId,
                ItemName = finalItemName,
                Quantity = finalQuantity,
                PriceIfLost = source.PriceIfLost
            };

            _context.RoomInventory.Add(clone);
            await _context.SaveChangesAsync();

            var created = await _context.RoomInventory
                .Include(ri => ri.Room)
                .AsNoTracking()
                .FirstAsync(ri => ri.Id == clone.Id);

            return CreatedAtAction(nameof(GetByRoom), new { roomId = targetRoomId }, MapRoomInventory(created));
        }
    }
}
