using backend.Common;
using backend.Data;
using backend.DTOs.RoomType;
using backend.Models;
using backend.Security;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomTypesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly CloudinaryService _cloudinaryService;
        //private readonly IValidator<CreateRoomTypeDTO> _createValidator;
        //private readonly IValidator<UpdateRoomTypeDTO> _updateValidator;

        public RoomTypesController(
            AppDbContext context,
            CloudinaryService cloudinaryService
            //IValidator<CreateRoomTypeDTO> createValidator,
            //IValidator<UpdateRoomTypeDTO> updateValidator
            )
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
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
                PrimaryImageUrl = roomType.RoomImages
                    .Where(ri => !string.IsNullOrWhiteSpace(ri.ImageUrl))
                    .OrderByDescending(ri => ri.IsPrimary ?? false)
                    .Select(ri => ri.ImageUrl)
                    .FirstOrDefault(),
                RoomCount = roomType.Rooms.Count(r => !r.IsDeleted),
                Rating = roomType.Reviews.Average(r => r.Rating) ?? 0,

                ReviewCount = roomType.Reviews.Count
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
                DeletedAt = roomType.DeletedAt,
                Rating = roomType.Reviews.Average(r => r.Rating) ?? 0,

                ReviewCount = roomType.Reviews.Count
            };
        }


        [HttpGet]
        [Permission("VIEW_ROOMS")]
        public async Task<ActionResult<PagedResponse<RoomTypeDTO>>> GetRoomTypes(
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15)
        {
            return await GetRoomTypesInternal(search, page, pageSize);
        }

        [HttpGet("public")]
        public async Task<ActionResult<PagedResponse<RoomTypeDTO>>> GetPublicRoomTypes(
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15)
        {
            return await GetRoomTypesInternal(search, page, pageSize);
        }

        private async Task<ActionResult<PagedResponse<RoomTypeDTO>>> GetRoomTypesInternal(
            string? search,
            int page,
            int pageSize)
        {
            var query = _context.RoomTypes
                .Include(rt => rt.Rooms)
                .Include(rt => rt.RoomImages)
                .Include(rt => rt.Reviews)
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
        [Permission("VIEW_ROOMS")]
        public async Task<ActionResult<RoomTypeDetailDTO>> GetRoomType(int id)
        {
            var roomType = await _context.RoomTypes
                .Include(rt => rt.RoomTypeAmenities)
                    .ThenInclude(rta => rta.Amenity)
                .Include(rt => rt.RoomImages)
                .Include(rt => rt.Rooms)
                .Include(rt => rt.Reviews)
                .AsNoTracking()
                .FirstOrDefaultAsync(rt => rt.Id == id);


            if (roomType == null)
            {
                return NotFound();
            }

            return Ok(MapRoomTypeDetail(roomType));
        }

        [HttpPost]
        [Permission("CREATE_ROOMS")]
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
                    .Select((url, index) => new RoomImage
                    {
                        ImageUrl = url.Trim(),
                        IsPrimary = index == 0
                    })
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
        [Permission("EDIT_ROOMS")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRoomTypeDTO dto)
        {
            var roomType = await _context.RoomTypes
                .Include(rt => rt.RoomImages)
                .FirstOrDefaultAsync(rt => rt.Id == id);
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
            if (dto.ImageUrls != null)
            {
                var oldUrls = roomType.RoomImages
                    .Where(ri => !string.IsNullOrWhiteSpace(ri.ImageUrl))
                    .Select(ri => ri.ImageUrl)
                    .ToList();
                var nextUrls = dto.ImageUrls
                    .Where(url => !string.IsNullOrWhiteSpace(url))
                    .Select(url => url.Trim())
                    .Distinct()
                    .ToList();

                _context.RoomImages.RemoveRange(roomType.RoomImages);
                roomType.RoomImages = nextUrls
                    .Select((url, index) => new RoomImage
                    {
                        RoomTypeId = roomType.Id,
                        ImageUrl = url,
                        IsPrimary = index == 0
                    })
                    .ToList();

                foreach (var oldUrl in oldUrls.Except(nextUrls))
                {
                    await _cloudinaryService.DeleteImageByUrlAsync(oldUrl);
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Permission("DELETE_ROOMS")]
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
                return BadRequest("Loại phòng đã bị xóa trước đó.");
            }

            if (roomType.Rooms.Any(r => !r.IsDeleted))
            {
                return BadRequest("Không thể xóa loại phòng khi vẫn còn phòng hoạt động thuộc loại này.");
            }

            _context.RoomTypes.Remove(roomType);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("deleted")]
        [Permission("VIEW_ROOMS")]
        public async Task<ActionResult<PagedResponse<RoomTypeDTO>>> GetDeletedRoomTypes(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15,
            [FromQuery] string? search = null)
        {
            var query = _context.RoomTypes
                .IgnoreQueryFilters()
                .Include(rt => rt.Rooms)
                .Include(rt => rt.RoomImages)
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
        [Permission("DELETE_ROOMS")]
        public async Task<IActionResult> Restore(int id)
        {
            var roomType = await _context.RoomTypes
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(rt => rt.Id == id);

            if (roomType == null || !roomType.IsDeleted)
            {
                return NotFound("Không tìm thấy loại phòng đã xóa.");
            }

            roomType.IsDeleted = false;
            roomType.DeletedAt = null;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("upload-image")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(20_000_000)]
        [Permission("CREATE_ROOMS", "EDIT_ROOMS")]
        public async Task<ActionResult<object>> UploadRoomTypeImage([FromForm] IFormFile file, [FromForm] string? roomTypeName = null)
        {
            if (file == null || file.Length <= 0)
            {
                return BadRequest("Vui lòng chọn ảnh loại phòng.");
            }

            var folderName = Slugify(roomTypeName);
            var folder = string.IsNullOrWhiteSpace(folderName)
                ? "home/room/general"
                : $"home/room/{folderName}";

            var uploadedUrl = await _cloudinaryService.UploadImageAsync(file, folder);
            if (string.IsNullOrWhiteSpace(uploadedUrl))
            {
                return StatusCode(500, "Upload ảnh loại phòng lên Cloudinary thất bại.");
            }

            return Ok(new { url = uploadedUrl, folder });
        }

        private static string Slugify(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return string.Empty;
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

            return builder.ToString().Trim('-');
        }
    }
}
