using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
   
    public class RoomsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoomsController(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ActionResult<IEnumerable<Room>>> GetAll()
        {
            return await _context.Rooms.ToListAsync();
        }

        public async Task<ActionResult<Room>> GetById(int id)
        {
            var entity = await _context.Rooms.FindAsync(id);
            if (entity == null) return NotFound();
            return entity;
        }

        public async Task<ActionResult<Room>> Create(Room room)
        {
            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = room.Id }, room);
        }

        public async Task<IActionResult> Update(int id, Room room)
        {
            if (id != room.Id) return BadRequest();

            _context.Entry(room).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Rooms.FindAsync(id);
            if (entity == null) return NotFound();

            _context.Rooms.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

