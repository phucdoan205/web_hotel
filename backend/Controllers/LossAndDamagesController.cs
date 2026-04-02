using backend.Data;
using backend.DTOs.LossAndDamage;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Tags("Loss And Damages")]
    public class LossAndDamagesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly CloudinaryService _cloudinary;

        public LossAndDamagesController(AppDbContext context, CloudinaryService cloudinary)
        {
            _context = context;
            _cloudinary = cloudinary;
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("File is required.");

            var url = await _cloudinary.UploadImageAsync(file, "hotel_assets/loss_and_damage");
            if (string.IsNullOrWhiteSpace(url))
            {
                return StatusCode(500, "Upload failed.");
            }

            return Ok(new { url });
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LossAndDamageResponseDTO>>> GetAll()
        {
            var items = await _context.LossAndDamages
                .Include(ld => ld.RoomInventory)
                    .ThenInclude(ri => ri!.Room)
                .AsNoTracking()
                .OrderByDescending(ld => ld.CreatedAt)
                .Select(ld => new LossAndDamageResponseDTO
                {
                    Id = ld.Id,
                    BookingDetailId = ld.BookingDetailId,
                    RoomInventoryId = ld.RoomInventoryId ?? 0,
                    ItemName = ld.RoomInventory != null ? ld.RoomInventory.ItemName : string.Empty,
                    Quantity = ld.Quantity,
                    PenaltyAmount = ld.PenaltyAmount,
                    Description = ld.Description,
                    ImageUrl = ld.ImageUrl,
                    Status = ld.Status,
                    DecisionStatus = ld.DecisionStatus,
                    CreatedAt = ld.CreatedAt,
                    ResolvedAt = ld.ResolvedAt,
                    RoomNumber = ld.RoomInventory != null && ld.RoomInventory.Room != null ? ld.RoomInventory.Room.RoomNumber : string.Empty
                })
                .ToListAsync();

            return Ok(items);
        }

        [HttpPost]
        public async Task<ActionResult<LossAndDamageResponseDTO>> Create([FromBody] LossAndDamageRequestDTO request)
        {
            var inventory = await _context.RoomInventory
                .Include(ri => ri.Room)
                .FirstOrDefaultAsync(ri => ri.Id == request.RoomInventoryId);

            if (inventory == null) return NotFound("Room inventory not found.");

            var entity = new LossAndDamage
            {
                BookingDetailId = request.BookingDetailId,
                RoomInventoryId = request.RoomInventoryId,
                Quantity = request.Quantity,
                PenaltyAmount = request.PenaltyAmount,
                Description = request.Description,
                ImageUrl = request.ImageUrl,
                Status = false,
                DecisionStatus = 0,
                CreatedAt = DateTime.UtcNow
            };

            _context.LossAndDamages.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(new LossAndDamageResponseDTO
            {
                Id = entity.Id,
                BookingDetailId = entity.BookingDetailId,
                RoomInventoryId = entity.RoomInventoryId ?? 0,
                ItemName = inventory.ItemName,
                Quantity = entity.Quantity,
                PenaltyAmount = entity.PenaltyAmount,
                Description = entity.Description,
                ImageUrl = entity.ImageUrl,
                Status = entity.Status,
                DecisionStatus = entity.DecisionStatus,
                CreatedAt = entity.CreatedAt,
                ResolvedAt = entity.ResolvedAt,
                RoomNumber = inventory.Room?.RoomNumber ?? string.Empty
            });
        }

        [HttpPatch("{id:int}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            var entity = await _context.LossAndDamages.FindAsync(id);
            if (entity == null) return NotFound();

            entity.Status = true;
            entity.DecisionStatus = 1;
            entity.ResolvedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("{id:int}/reject")]
        public async Task<IActionResult> Reject(int id)
        {
            var entity = await _context.LossAndDamages.FindAsync(id);
            if (entity == null) return NotFound();

            entity.Status = true;
            entity.DecisionStatus = 2;
            entity.ResolvedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
