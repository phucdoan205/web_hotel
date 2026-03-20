using backend.Common;
using backend.Data;
using backend.DTOs.RoomType;
using backend.Models;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomTypesController : ControllerBase
    {
        private readonly AppDbContext _context;
        //private readonly IValidator<CreateRoomTypeDTO> _createValidator;
        //private readonly IValidator<UpdateRoomTypeDTO> _updateValidator;

        public RoomTypesController(
            AppDbContext context
            //IValidator<CreateRoomTypeDTO> createValidator,
            //IValidator<UpdateRoomTypeDTO> updateValidator
            )
        {
            _context = context;
            //_createValidator = createValidator;
            //_updateValidator = updateValidator;
        }

        private static RoomTypeDTO MapRoomType(RoomType roomType)
        {
            return new RoomTypeDTO
            {
                Id = roomType.Id,
                Name = roomType.Name,
                BasePrice = roomType.BasePrice,
                CapacityAdults = roomType.CapacityAdults,
                CapacityChildren = roomType.CapacityChildren,
                Size = roomType.Size,
                BedType = roomType.BedType,
                Description = roomType.Description,
                RoomCount = roomType.Rooms.Count(r => !r.IsDeleted)
            };
        }

        private static RoomTypeDetailDTO MapRoomTypeDetail(RoomType roomType)
        {
            return new RoomTypeDetailDTO
            {
                Id = roomType.Id,
                Name = roomType.Name,
                BasePrice = roomType.BasePrice,
                CapacityAdults = roomType.CapacityAdults,
                CapacityChildren = roomType.CapacityChildren,
                Size = roomType.Size,
                BedType = roomType.BedType,
                Description = roomType.Description,
                Amenities = roomType.RoomTypeAmenities
                    .Where(rta => rta.Amenity != null)
                    .Select(rta => rta.Amenity.Name)
                    .ToList(),
                ImageUrls = roomType.RoomImages
                    .Where(ri => !string.IsNullOrWhiteSpace(ri.ImageUrl))
                    .Select(ri => ri.ImageUrl)
                    .ToList(),
                RoomCount = roomType.Rooms.Count(r => !r.IsDeleted),
                IsDeleted = roomType.IsDeleted,
                DeletedAt = roomType.DeletedAt
            };
        }

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

            return Ok(new PagedResponse<RoomTypeDTO>(items.Select(MapRoomType).ToList(), total, page, pageSize));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<RoomTypeDetailDTO>> GetRoomType(int id)
        {
            var roomType = await _context.RoomTypes
                .Include(rt => rt.RoomTypeAmenities)
                    .ThenInclude(rta => rta.Amenity)
                .Include(rt => rt.RoomImages)
                .Include(rt => rt.Rooms)
                .AsNoTracking()
                .FirstOrDefaultAsync(rt => rt.Id == id);

            if (roomType == null)
            {
                return NotFound();
            }

            return Ok(MapRoomTypeDetail(roomType));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRoomTypeDTO dto)
        {
            //var validation = await _createValidator.ValidateAsync(dto);
            //if (!validation.IsValid)
            //{
            //    return BadRequest(validation.Errors);
            //}

            var roomType = new RoomType
            {
                Name = dto.Name.Trim(),
                BasePrice = dto.BasePrice,
                CapacityAdults = dto.CapacityAdults,
                CapacityChildren = dto.CapacityChildren,
                Size = dto.Size,
                BedType = string.IsNullOrWhiteSpace(dto.BedType) ? null : dto.BedType.Trim(),
                Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim()
            };

            if (dto.AmenityIds?.Any() == true)
            {
                roomType.RoomTypeAmenities = dto.AmenityIds
                    .Distinct()
                    .Select(id => new RoomTypeAmenity { AmenityId = id })
                    .ToList();
            }

            if (dto.ImageUrls?.Any() == true)
            {
                roomType.RoomImages = dto.ImageUrls
                    .Where(url => !string.IsNullOrWhiteSpace(url))
                    .Select(url => new RoomImage { ImageUrl = url.Trim() })
                    .ToList();
            }

            _context.RoomTypes.Add(roomType);
            await _context.SaveChangesAsync();

            var created = await _context.RoomTypes
                .Include(rt => rt.RoomTypeAmenities)
                    .ThenInclude(rta => rta.Amenity)
                .Include(rt => rt.RoomImages)
                .Include(rt => rt.Rooms)
                .AsNoTracking()
                .FirstAsync(rt => rt.Id == roomType.Id);

            return CreatedAtAction(nameof(GetRoomType), new { id = roomType.Id }, MapRoomTypeDetail(created));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRoomTypeDTO dto)
        {
            var roomType = await _context.RoomTypes.FirstOrDefaultAsync(rt => rt.Id == id);
            if (roomType == null)
            {
                return NotFound();
            }

            //var validationContext = new ValidationContext<UpdateRoomTypeDTO>(dto);
            //validationContext.RootContextData["RoomTypeId"] = id;
            //var validation = await _updateValidator.ValidateAsync(validationContext);

            //if (!validation.IsValid)
            //{
            //    return BadRequest(validation.Errors);
            //}

            if (!string.IsNullOrWhiteSpace(dto.Name))
                roomType.Name = dto.Name.Trim();
            if (dto.BasePrice.HasValue)
                roomType.BasePrice = dto.BasePrice.Value;
            if (dto.CapacityAdults.HasValue)
                roomType.CapacityAdults = dto.CapacityAdults.Value;
            if (dto.CapacityChildren.HasValue)
                roomType.CapacityChildren = dto.CapacityChildren.Value;
            if (dto.Size.HasValue)
                roomType.Size = dto.Size.Value;
            if (dto.BedType != null)
                roomType.BedType = string.IsNullOrWhiteSpace(dto.BedType) ? null : dto.BedType.Trim();
            if (dto.Description != null)
                roomType.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var roomType = await _context.RoomTypes
                .IgnoreQueryFilters()
                .Include(rt => rt.Rooms)
                .FirstOrDefaultAsync(rt => rt.Id == id);

            if (roomType == null)
            {
                return NotFound();
            }

            if (roomType.IsDeleted)
            {
                return BadRequest("Loai phong da bi xoa truoc do.");
            }

            if (roomType.Rooms.Any(r => !r.IsDeleted))
            {
                return BadRequest("Khong the xoa loai phong khi van con phong hoat dong thuoc loai nay.");
            }

            _context.RoomTypes.Remove(roomType);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("deleted")]
        public async Task<ActionResult<PagedResponse<RoomTypeDTO>>> GetDeletedRoomTypes(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15,
            [FromQuery] string? search = null)
        {
            var query = _context.RoomTypes
                .IgnoreQueryFilters()
                .Include(rt => rt.Rooms)
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

            return Ok(new PagedResponse<RoomTypeDTO>(items.Select(MapRoomType).ToList(), total, page, pageSize));
        }

        [HttpPost("{id:int}/restore")]
        public async Task<IActionResult> Restore(int id)
        {
            var roomType = await _context.RoomTypes
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(rt => rt.Id == id);

            if (roomType == null || !roomType.IsDeleted)
            {
                return NotFound("Khong tim thay loai phong da xoa.");
            }

            roomType.IsDeleted = false;
            roomType.DeletedAt = null;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
