using AutoMapper;
using backend.Data;
using backend.DTOs.RoomInventory;
using backend.Models;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomInventoriesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateRoomInventoryDTO> _createValidator;
        private readonly IValidator<UpdateRoomInventoryDTO> _updateValidator;

        public RoomInventoriesController(
            AppDbContext context,
            IMapper mapper,
            IValidator<CreateRoomInventoryDTO> createValidator,
            IValidator<UpdateRoomInventoryDTO> updateValidator)
        {
            _context = context;
            _mapper = mapper;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        // GET: api/RoomInventories/room/{roomId}
        [HttpGet("room/{roomId}")]
        public async Task<ActionResult<List<RoomInventoryDTO>>> GetByRoom(int roomId)
        {
            var items = await _context.RoomInventory
                .Include(ri => ri.Room)
                .Where(ri => ri.RoomId == roomId && !ri.Room!.IsDeleted)
                .AsNoTracking()
                .ToListAsync();

            if (!items.Any()) return Ok(new List<RoomInventoryDTO>());

            return Ok(_mapper.Map<List<RoomInventoryDTO>>(items));
        }

        // POST: api/RoomInventories
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRoomInventoryDTO dto)
        {
            var validation = await _createValidator.ValidateAsync(dto);
            if (!validation.IsValid) return BadRequest(validation.Errors);

            var entity = _mapper.Map<RoomInventory>(dto);

            _context.RoomInventory.Add(entity);
            await _context.SaveChangesAsync();

            var result = _mapper.Map<RoomInventoryDTO>(entity);
            return CreatedAtAction(nameof(GetByRoom), new { roomId = dto.RoomId }, result);
        }

        // PUT: api/RoomInventories/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRoomInventoryDTO dto)
        {
            var item = await _context.RoomInventory
                .Include(ri => ri.Room)
                .FirstOrDefaultAsync(ri => ri.Id == id);

            if (item == null) return NotFound();
            if (item.Room!.IsDeleted) return BadRequest("Phòng đã bị xóa");

            var validation = await _updateValidator.ValidateAsync(dto);
            if (!validation.IsValid) return BadRequest(validation.Errors);

            _mapper.Map(dto, item);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/RoomInventories/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.RoomInventory
                .Include(ri => ri.Room)
                .FirstOrDefaultAsync(ri => ri.Id == id);

            if (item == null) return NotFound();
            if (item.Room!.IsDeleted) return BadRequest("Phòng đã bị xóa");

            // Business rule: kiểm tra có LossAndDamage liên quan không
            var hasDamage = await _context.LossAndDamages
                .AnyAsync(ld => ld.RoomInventoryId == id);

            if (hasDamage)
            {
                return BadRequest("Không thể xóa vật dụng đang có ghi nhận mất mát/hư hỏng");
            }

            _context.RoomInventory.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
