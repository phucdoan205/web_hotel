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
        public async Task<ActionResult<IEnumerable<AmenityDTO>>> GetAll()
        {
            var items = await _context.Amenities
                .Where(x => x.IsActive)
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
        public async Task<IActionResult> Update(int id, Models.Amenity amenity)
        {
            if (id != amenity.Id)
            {
                return BadRequest();
            }

            _context.Entry(amenity).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AmenityExists(id))
                {
                    return NotFound();
                }

                throw;
            }

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

            entity.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AmenityExists(int id)
        {
            return _context.Amenities.Any(e => e.Id == id);
        }
    }
}
