using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    
    public class RoomImagesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoomImagesController(AppDbContext context)
        {
            _context = context;
        }


        public async Task<ActionResult<IEnumerable<RoomImage>>> GetAll()
        {
            return await _context.RoomImages.ToListAsync();
        }

        public async Task<ActionResult<RoomImage>> GetById(int id)
        {
            var entity = await _context.RoomImages.FindAsync(id);
            if (entity == null) return NotFound();
            return entity;
        }

        public async Task<ActionResult<RoomImage>> Create(RoomImage roomImage)
        {
            _context.RoomImages.Add(roomImage);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = roomImage.Id }, roomImage);
        }

        public async Task<IActionResult> Update(int id, RoomImage roomImage)
        {
            if (id != roomImage.Id) return BadRequest();

            _context.Entry(roomImage).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.RoomImages.FindAsync(id);
            if (entity == null) return NotFound();

            _context.RoomImages.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

