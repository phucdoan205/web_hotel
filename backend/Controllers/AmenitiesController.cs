using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    
    public class AmenitiesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AmenitiesController(AppDbContext context)
        {
            _context = context;
        }

      
        public async Task<ActionResult<IEnumerable<Amenity>>> GetAll()
        {
            return await _context.Amenities.ToListAsync();
        }

       
        public async Task<ActionResult<Amenity>> GetById(int id)
        {
            var entity = await _context.Amenities.FindAsync(id);
            if (entity == null) return NotFound();
            return entity;
        }

       
        public async Task<ActionResult<Amenity>> Create(Amenity amenity)
        {
            _context.Amenities.Add(amenity);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = amenity.Id }, amenity);
        }

       
        public async Task<IActionResult> Update(int id, Amenity amenity)
        {
            if (id != amenity.Id) return BadRequest();

            _context.Entry(amenity).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

       
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Amenities.FindAsync(id);
            if (entity == null) return NotFound();

            _context.Amenities.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

