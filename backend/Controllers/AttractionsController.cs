using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    
    public class AttractionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AttractionsController(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ActionResult<IEnumerable<Attraction>>> GetAll()
        {
            return await _context.Attractions.ToListAsync();
        }

     
        public async Task<ActionResult<Attraction>> GetById(int id)
        {
            var entity = await _context.Attractions.FindAsync(id);
            if (entity == null) return NotFound();
            return entity;
        }

       
        public async Task<ActionResult<Attraction>> Create(Attraction attraction)
        {
            _context.Attractions.Add(attraction);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = attraction.Id }, attraction);
        }

     
        public async Task<IActionResult> Update(int id, Attraction attraction)
        {
            if (id != attraction.Id) return BadRequest();

            _context.Entry(attraction).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

       
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Attractions.FindAsync(id);
            if (entity == null) return NotFound();

            _context.Attractions.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

