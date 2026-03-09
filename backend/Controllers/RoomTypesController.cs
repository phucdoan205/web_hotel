using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
  
    public class RoomTypesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoomTypesController(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ActionResult<IEnumerable<RoomType>>> GetAll()
        {
            return await _context.RoomTypes.ToListAsync();
        }

        public async Task<ActionResult<RoomType>> GetById(int id)
        {
            var entity = await _context.RoomTypes.FindAsync(id);
            if (entity == null) return NotFound();
            return entity;
        }


        public async Task<ActionResult<RoomType>> Create(RoomType roomType)
        {
            _context.RoomTypes.Add(roomType);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = roomType.Id }, roomType);
        }

        public async Task<IActionResult> Update(int id, RoomType roomType)
        {
            if (id != roomType.Id) return BadRequest();

            _context.Entry(roomType).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.RoomTypes.FindAsync(id);
            if (entity == null) return NotFound();

            _context.RoomTypes.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

