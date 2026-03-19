using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
   
    public class RoomTypeAmenitiesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoomTypeAmenitiesController(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ActionResult<IEnumerable<RoomTypeAmenity>>> GetAll()
        {
            return await _context.RoomTypeAmenities.ToListAsync();
        }

        public async Task<ActionResult<RoomTypeAmenity>> GetById(int roomTypeId, int amenityId)
        {
            var entity = await _context.RoomTypeAmenities
                .FirstOrDefaultAsync(x => x.RoomTypeId == roomTypeId && x.AmenityId == amenityId);

            if (entity == null) return NotFound();
            return entity;
        }

        public async Task<ActionResult<RoomTypeAmenity>> Create(RoomTypeAmenity roomTypeAmenity)
        {
            _context.RoomTypeAmenities.Add(roomTypeAmenity);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { roomTypeId = roomTypeAmenity.RoomTypeId, amenityId = roomTypeAmenity.AmenityId }, roomTypeAmenity);
        }

        public async Task<IActionResult> Delete(int roomTypeId, int amenityId)
        {
            var entity = await _context.RoomTypeAmenities
                .FirstOrDefaultAsync(x => x.RoomTypeId == roomTypeId && x.AmenityId == amenityId);

            if (entity == null) return NotFound();

            _context.RoomTypeAmenities.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

