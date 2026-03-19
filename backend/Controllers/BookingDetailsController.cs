using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingDetailsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BookingDetailsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingDetail>>> GetAll()
        {
            return await _context.BookingDetails.ToListAsync();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<BookingDetail>> GetById(int id)
        {
            var entity = await _context.BookingDetails.FindAsync(id);
            if (entity == null) return NotFound();
            return entity;
        }

        [HttpPost]
        public async Task<ActionResult<BookingDetail>> Create(BookingDetail bookingDetail)
        {
            _context.BookingDetails.Add(bookingDetail);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = bookingDetail.Id }, bookingDetail);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, BookingDetail bookingDetail)
        {
            if (id != bookingDetail.Id) return BadRequest();

            _context.Entry(bookingDetail).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.BookingDetails.FindAsync(id);
            if (entity == null) return NotFound();

            _context.BookingDetails.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

