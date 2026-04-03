using backend.Data;
using backend.DTOs.Guest;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Tags("Guest")]
    public class GuestController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GuestController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GuestResponseDTO>>> GetAll()
        {
            var guests = await _context.Guests
                .AsNoTracking()
                .Select(g => new GuestResponseDTO
                {
                    Id = g.Id,
                    Name = g.Name,
                    Phone = g.Phone,
                    Email = g.Email,
                    BookingCount = g.Bookings.Count
                })
                .OrderBy(g => g.Name)
                .ToListAsync();

            return Ok(guests);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<GuestResponseDTO>> GetById(int id)
        {
            var guest = await _context.Guests
                .AsNoTracking()
                .Where(g => g.Id == id)
                .Select(g => new GuestResponseDTO
                {
                    Id = g.Id,
                    Name = g.Name,
                    Phone = g.Phone,
                    Email = g.Email,
                    BookingCount = g.Bookings.Count
                })
                .FirstOrDefaultAsync();

            if (guest == null)
            {
                return NotFound();
            }

            return Ok(guest);
        }

        [HttpPost]
        public async Task<ActionResult<GuestResponseDTO>> Create([FromBody] GuestRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Name is required.");
            }

            var guest = new Guest
            {
                Name = request.Name.Trim(),
                Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
                Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim()
            };

            _context.Guests.Add(guest);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = guest.Id }, new GuestResponseDTO
            {
                Id = guest.Id,
                Name = guest.Name,
                Phone = guest.Phone,
                Email = guest.Email,
                BookingCount = 0
            });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] GuestRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Name is required.");
            }

            var guest = await _context.Guests.FirstOrDefaultAsync(g => g.Id == id);
            if (guest == null)
            {
                return NotFound();
            }

            guest.Name = request.Name.Trim();
            guest.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
            guest.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var guest = await _context.Guests
                .Include(g => g.Bookings)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (guest == null)
            {
                return NotFound();
            }

            if (guest.Bookings.Any())
            {
                return BadRequest("Cannot delete guest that is linked to bookings.");
            }

            _context.Guests.Remove(guest);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
