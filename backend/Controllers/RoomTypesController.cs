using AutoMapper;
using backend.Common;
using backend.Data;
using backend.DTOs.RoomType;
using backend.Models;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomTypesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateRoomTypeDTO> _createValidator;
        private readonly IValidator<UpdateRoomTypeDTO> _updateValidator;

        public RoomTypesController(
            AppDbContext context,
            IMapper mapper,
            IValidator<CreateRoomTypeDTO> createValidator,
            IValidator<UpdateRoomTypeDTO> updateValidator)
        {
            _context = context;
            _mapper = mapper;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        // GET: api/RoomTypes
        [HttpGet]
        public async Task<ActionResult<PagedResponse<RoomTypeDTO>>> GetRoomTypes(
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15)
        {
            var query = _context.RoomTypes
                .Include(rt => rt.Rooms)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(rt => rt.Name.Contains(search.Trim()));
            }

            var total = await query.CountAsync();

            var items = await query
                .OrderBy(rt => rt.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = _mapper.Map<List<RoomTypeDTO>>(items);

            return Ok(new PagedResponse<RoomTypeDTO>(dtos, total, page, pageSize));
        }

        // GET: api/RoomTypes/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<RoomTypeDetailDTO>> GetRoomType(int id)
        {
            var roomType = await _context.RoomTypes
                .Include(rt => rt.RoomTypeAmenities).ThenInclude(a => a.Amenity)
                .Include(rt => rt.RoomImages)
                .Include(rt => rt.Rooms)
                .FirstOrDefaultAsync(rt => rt.Id == id);

            if (roomType == null) return NotFound();

            return Ok(_mapper.Map<RoomTypeDetailDTO>(roomType));
        }

        // POST: api/RoomTypes
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRoomTypeDTO dto)
        {
            var validation = await _createValidator.ValidateAsync(dto);
            if (!validation.IsValid) return BadRequest(validation.Errors);

            var roomType = _mapper.Map<RoomType>(dto);

            if (dto.AmenityIds?.Any() == true)
            {
                roomType.RoomTypeAmenities = dto.AmenityIds
                    .Select(id => new RoomTypeAmenity { AmenityId = id })
                    .ToList();
            }

            _context.RoomTypes.Add(roomType);
            await _context.SaveChangesAsync();

            var result = _mapper.Map<RoomTypeDetailDTO>(roomType);
            return CreatedAtAction(nameof(GetRoomType), new { id = roomType.Id }, result);
        }

        // PUT: api/RoomTypes/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRoomTypeDTO dto)
        {
            var roomType = await _context.RoomTypes.FindAsync(id);
            if (roomType == null) return NotFound();

            var validationContext = new ValidationContext<UpdateRoomTypeDTO>(dto);
            validationContext.RootContextData["RoomTypeId"] = id;
            var validation = await _updateValidator.ValidateAsync(validationContext);

            if (!validation.IsValid) return BadRequest(validation.Errors);

            _mapper.Map(dto, roomType);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/RoomTypes/{id} (soft-delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var roomType = await _context.RoomTypes
                .IgnoreQueryFilters()  // Quan trọng! Để tìm được cả record đã soft-delete
                .Include(rt => rt.Rooms)
                .FirstOrDefaultAsync(rt => rt.Id == id);

            if (roomType == null)
                return NotFound();

            if (roomType.IsDeleted)
                return BadRequest("Loại phòng đã bị xóa trước đó.");

            // Business rule: không cho xóa nếu còn phòng đang hoạt động
            var hasActiveRooms = roomType.Rooms.Any(r => !r.IsDeleted);
            if (hasActiveRooms)
            {
                return BadRequest("Không thể xóa loại phòng khi vẫn còn phòng hoạt động thuộc loại này.");
            }

            _context.RoomTypes.Remove(roomType);  // ← interceptor sẽ chuyển thành soft-delete

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/RoomTypes/deleted
        [HttpGet("deleted")]
        public async Task<ActionResult<PagedResult<RoomTypeDTO>>> GetDeletedRoomTypes(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15,
            [FromQuery] string? search = null)
        {
            var query = _context.RoomTypes
                .IgnoreQueryFilters()
                .Where(rt => rt.IsDeleted);

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(rt => rt.Name.Contains(search.Trim()));
            }

            var total = await query.CountAsync();

            var items = await query
                .OrderByDescending(rt => rt.DeletedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();

            var dtos = _mapper.Map<List<RoomTypeDTO>>(items);

            return Ok(new PagedResponse<RoomTypeDTO>(dtos, total, page, pageSize));
        }

        // POST: api/RoomTypes/{id}/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> Restore(int id)
        {
            var roomType = await _context.RoomTypes
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(rt => rt.Id == id);

            if (roomType == null || !roomType.IsDeleted)
                return NotFound("Không tìm thấy loại phòng đã xóa.");

            roomType.IsDeleted = false;
            roomType.DeletedAt = null;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
