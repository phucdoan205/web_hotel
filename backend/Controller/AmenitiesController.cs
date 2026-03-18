using backend.Data;
using backend.Models;
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

        // GET: api/Amenities
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Amenity>>> GetAll()
        {
            // Chỉ lấy những cái chưa bị xóa (IsActive = true) nếu bạn muốn ẩn trên FE hoàn toàn
            return await _context.Amenities
                .Where(x => x.IsActive == true)
                .ToListAsync();
        }

        // GET: api/Amenities/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Amenity>> GetById(int id)
        {
            var entity = await _context.Amenities.FindAsync(id);
            if (entity == null || entity.IsActive == false) return NotFound();

            return entity;
        }

        // POST: api/Amenities
        [HttpPost]
        public async Task<ActionResult<Amenity>> Create(Amenity amenity)
        {
            amenity.IsActive = true; // Đảm bảo khi tạo mới luôn là true
            _context.Amenities.Add(amenity);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = amenity.Id }, amenity);
        }

        // PUT: api/Amenities/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Amenity amenity)
        {
            if (id != amenity.Id) return BadRequest();

            _context.Entry(amenity).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AmenityExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // DELETE: api/Amenities/{id} (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Amenities.FindAsync(id);
            if (entity == null) return NotFound();

            // Thay vì _context.Remove, ta chỉ cập nhật trạng thái
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