using backend.Data;
using backend.DTOs.Amenity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AmenitiesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AmenitiesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AmenityDTO>>> GetAll([FromQuery] bool includeInactive = false)
        {
            var query = _context.Amenities.AsQueryable();
            
            if (!includeInactive)
            {
                query = query.Where(x => x.IsActive);
            }

            var items = await query
                .Select(x => new AmenityDTO
                {
                    Id = x.Id,
                    Name = x.Name,
                    IconUrl = x.IconUrl,
                    IsActive = x.IsActive
                })
                .AsNoTracking()
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<AmenityDTO>> GetById(int id)
        {
            var entity = await _context.Amenities
                .Where(x => x.Id == id && x.IsActive)
                .Select(x => new AmenityDTO
                {
                    Id = x.Id,
                    Name = x.Name,
                    IconUrl = x.IconUrl,
                    IsActive = x.IsActive
                })
                .AsNoTracking()
                .FirstOrDefaultAsync();

            if (entity == null)
            {
                return NotFound();
            }

            return Ok(entity);
        }

        [HttpPost]
        public async Task<ActionResult<AmenityDTO>> Create([FromBody] CreateAmenityDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Name is required.");
            }

            var amenity = new Models.Amenity
            {
                Name = request.Name.Trim(),
                IconUrl = string.IsNullOrWhiteSpace(request.IconUrl) ? null : request.IconUrl.Trim(),
                IsActive = true
            };

            _context.Amenities.Add(amenity);
            await _context.SaveChangesAsync();

            var result = new AmenityDTO
            {
                Id = amenity.Id,
                Name = amenity.Name,
                IconUrl = amenity.IconUrl,
                IsActive = amenity.IsActive
            };

            return CreatedAtAction(nameof(GetById), new { id = amenity.Id }, result);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateAmenityDTO request)
        {
            var amenity = await _context.Amenities.FindAsync(id);
            if (amenity == null)
            {
                return NotFound();
            }

            amenity.Name = request.Name.Trim();
            amenity.IconUrl = string.IsNullOrWhiteSpace(request.IconUrl) ? null : request.IconUrl.Trim();

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("{id:int}/toggle")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var amenity = await _context.Amenities.FindAsync(id);
            if (amenity == null)
            {
                return NotFound();
            }

            amenity.IsActive = !amenity.IsActive;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Amenities.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            _context.Amenities.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AmenityExists(int id)
        {
            return _context.Amenities.Any(e => e.Id == id);
        }
    }
}
