using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Tags("Room Types")]
    public class RoomTypesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoomTypesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoomType>>> GetAll()
        {
            return await _context.RoomTypes.ToListAsync();
        }

        [HttpGet("{id:int}")]
        [ApiExplorerSettings(IgnoreApi = true)]
        public async Task<ActionResult<RoomType>> GetById(int id)
        {
            var entity = await _context.RoomTypes.FindAsync(id);
            if (entity == null) return NotFound();
            return entity;
        }

        [HttpPost]
        [ApiExplorerSettings(IgnoreApi = true)]
        public async Task<ActionResult<RoomType>> Create(RoomType roomType)
        {
            _context.RoomTypes.Add(roomType);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = roomType.Id }, roomType);
        }

        [HttpPut("{id:int}")]
        [ApiExplorerSettings(IgnoreApi = true)]
        public async Task<IActionResult> Update(int id, RoomType roomType)
        {
            if (id != roomType.Id) return BadRequest();

            _context.Entry(roomType).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] bool force = false)
        {
            var entity = await _context.RoomTypes
                .Include(rt => rt.Rooms)
                .Include(rt => rt.BookingDetails)
                .Include(rt => rt.Reviews)
                .FirstOrDefaultAsync(rt => rt.Id == id);

            if (entity == null) return NotFound();

            if (!force)
            {
                // Check if there are associated rooms, bookings, or reviews
                if (entity.Rooms.Any() || entity.BookingDetails.Any() || entity.Reviews.Any())
                {
                    return BadRequest(new {
                        message = "Cannot delete this room type because it has associated data.",
                        details = "This room type is linked to existing rooms, bookings, or reviews. Use '?force=true' to delete everything related (Caution: this will remove booking history).",
                        counts = new {
                            rooms = entity.Rooms.Count,
                            bookings = entity.BookingDetails.Count,
                            reviews = entity.Reviews.Count
                        }
                    });
                }
            }

            // Clean up related data
            var images = _context.RoomImages.Where(i => i.RoomTypeId == id);
            var amenities = _context.RoomTypeAmenities.Where(a => a.RoomTypeId == id);
            
            _context.RoomImages.RemoveRange(images);
            _context.RoomTypeAmenities.RemoveRange(amenities);

            if (force)
            {
                // Deeper cleanup if forced
                _context.Reviews.RemoveRange(entity.Reviews);
                
                // Note: BookingDetails might have deep dependencies (OrderServices, LossAndDamages)
                // We remove them to satisfy the FK constraint
                foreach (var detail in entity.BookingDetails)
                {
                    var services = _context.OrderServiceDetails.Where(osd => osd.OrderServiceId != null); // Simplified
                    _context.BookingDetails.Remove(detail);
                }
                
                _context.Rooms.RemoveRange(entity.Rooms);
            }
            
            _context.RoomTypes.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        public sealed class RoomTypeImageCreateRequest
        {
            public string ImageUrl { get; set; } = null!;
            public bool? IsPrimary { get; set; }
        }

        [HttpPost("{id:int}/images")]
        public async Task<ActionResult<RoomImage>> AddImage(int id, RoomTypeImageCreateRequest request)
        {
            var roomTypeExists = await _context.RoomTypes.AnyAsync(rt => rt.Id == id);
            if (!roomTypeExists) return NotFound();

            var image = new RoomImage
            {
                RoomTypeId = id,
                ImageUrl = request.ImageUrl,
                IsPrimary = request.IsPrimary
            };

            if (request.IsPrimary == true)
            {
                var existing = await _context.RoomImages.Where(x => x.RoomTypeId == id).ToListAsync();
                foreach (var img in existing) img.IsPrimary = false;
            }

            _context.RoomImages.Add(image);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id }, image);
        }

        [HttpDelete("images/{imageId:int}")]
        public async Task<IActionResult> DeleteImage(int imageId)
        {
            var image = await _context.RoomImages.FindAsync(imageId);
            if (image == null) return NotFound();

            _context.RoomImages.Remove(image);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("{roomTypeId:int}/images/{imageId:int}/set-primary")]
        public async Task<IActionResult> SetPrimaryImage(int roomTypeId, int imageId)
        {
            var images = await _context.RoomImages.Where(x => x.RoomTypeId == roomTypeId).ToListAsync();
            if (images.Count == 0) return NotFound();

            var target = images.FirstOrDefault(x => x.Id == imageId);
            if (target == null) return NotFound();

            foreach (var img in images) img.IsPrimary = img.Id == imageId;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

