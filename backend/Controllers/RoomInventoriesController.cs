using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
   
    public class RoomInventoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoomInventoriesController(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ActionResult<IEnumerable<RoomInventory>>> GetAll()
        {
            return await _context.RoomInventories.ToListAsync();
        }

        public async Task<ActionResult<RoomInventory>> GetById(int id)
        {
            var entity = await _context.RoomInventories.FindAsync(id);
            if (entity == null) return NotFound();
            return entity;
        }

        public async Task<ActionResult<RoomInventory>> Create(RoomInventory roomInventory)
        {
            _context.RoomInventories.Add(roomInventory);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = roomInventory.Id }, roomInventory);
        }

        public async Task<IActionResult> Update(int id, RoomInventory roomInventory)
        {
            if (id != roomInventory.Id) return BadRequest();

            _context.Entry(roomInventory).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.RoomInventories.FindAsync(id);
            if (entity == null) return NotFound();

            _context.RoomInventories.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

