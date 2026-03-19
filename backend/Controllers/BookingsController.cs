using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BookingsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Booking>>> GetAll()
        {
            return await _context.Bookings.ToListAsync();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Booking>> GetById(int id)
        {
            var entity = await _context.Bookings.FindAsync(id);
            if (entity == null) return NotFound();
            return entity;
        }

        [HttpPost]
        public async Task<ActionResult<Booking>> Create(Booking booking)
        {
            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = booking.Id }, booking);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, Booking booking)
        {
            if (id != booking.Id) return BadRequest();

            _context.Entry(booking).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Bookings.FindAsync(id);
            if (entity == null) return NotFound();

            _context.Bookings.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

