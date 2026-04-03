using AutoMapper;
using backend.Data;
using backend.DTOs.Amenity;
using backend.DTOs.RoomType;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/RoomTypes/{roomTypeId}/Amenities")]
    public class RoomTypeAmenitiesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public RoomTypeAmenitiesController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/roomtypes/5/amenities - Lấy danh sách amenity của RoomType
        [HttpGet]
        public async Task<ActionResult<List<AmenityDTO>>> GetAmenities(int roomTypeId)
        {
            // Kiểm tra RoomType tồn tại
            var roomTypeExists = await _context.RoomTypes
                .AnyAsync(rt => rt.Id == roomTypeId);

            if (!roomTypeExists)
                return NotFound(new { Message = $"RoomType với Id {roomTypeId} không tồn tại." });

            var amenities = await _context.RoomTypeAmenities
                .Where(rta => rta.RoomTypeId == roomTypeId)
                .Include(rta => rta.Amenity)
                .Select(rta => rta.Amenity)
                .AsNoTracking()
                .ToListAsync();

            var dtos = _mapper.Map<List<AmenityDTO>>(amenities);
            return Ok(dtos);
        }

        // POST: api/roomtypes/5/amenities - Thêm amenity vào RoomType
        [HttpPost("{amenityId}")]
        public async Task<IActionResult> AddAmenity(int roomTypeId, int amenityId)
        {
            // Validation thủ công
            if (amenityId <= 0)
                return BadRequest(new { Message = "AmenityId phải lớn hơn 0." });

            // Kiểm tra RoomType tồn tại
            var roomTypeExists = await _context.RoomTypes
                .AnyAsync(rt => rt.Id == roomTypeId);

            if (!roomTypeExists)
                return NotFound(new { Message = $"RoomType với Id {roomTypeId} không tồn tại." });

            // Kiểm tra Amenity tồn tại và đang active
            var amenity = await _context.Amenities
                .FirstOrDefaultAsync(a => a.Id == amenityId && a.IsActive);

            if (amenity == null)
                return BadRequest(new { Message = "Amenity không tồn tại hoặc không active." });

            // Kiểm tra đã tồn tại liên kết chưa
            var alreadyExists = await _context.RoomTypeAmenities
                .AnyAsync(rta => rta.RoomTypeId == roomTypeId && rta.AmenityId == amenityId);

            if (alreadyExists)
                return BadRequest(new { Message = "Amenity này đã được gán cho RoomType." });

            var roomTypeAmenity = new RoomTypeAmenity
            {
                RoomTypeId = roomTypeId,
                AmenityId = amenityId
            };

            _context.RoomTypeAmenities.Add(roomTypeAmenity);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAmenities), new { roomTypeId }, null);
        }

        // PUT: api/roomtypes/5/amenities - Thay thế toàn bộ danh sách amenity
        [HttpPut]
        public async Task<IActionResult> UpdateAmenities(int roomTypeId, [FromBody] List<int> amenityIds)
        {
            if (amenityIds == null)
                amenityIds = new List<int>();

            // Kiểm tra RoomType tồn tại
            var roomTypeExists = await _context.RoomTypes
                .AnyAsync(rt => rt.Id == roomTypeId);

            if (!roomTypeExists)
                return NotFound(new { Message = $"RoomType với Id {roomTypeId} không tồn tại." });

            // Xóa tất cả amenity cũ của RoomType này
            var existingAmenities = await _context.RoomTypeAmenities
                .Where(rta => rta.RoomTypeId == roomTypeId)
                .ToListAsync();

            _context.RoomTypeAmenities.RemoveRange(existingAmenities);

            // Thêm danh sách amenity mới (nếu có)
            if (amenityIds.Any())
            {
                // Tránh .Contains() bằng cách dùng JOIN hoặc Any() thủ công
                var newAmenities = new List<RoomTypeAmenity>();

                foreach (var id in amenityIds.Distinct())  // tránh trùng lặp
                {
                    var exists = await _context.Amenities
                        .AnyAsync(a => a.Id == id && a.IsActive);

                    if (exists)
                    {
                        newAmenities.Add(new RoomTypeAmenity
                        {
                            RoomTypeId = roomTypeId,
                            AmenityId = id
                        });
                    }
                }

                if (newAmenities.Any())
                    _context.RoomTypeAmenities.AddRange(newAmenities);
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Cập nhật danh sách amenities thành công." });
        }

        // DELETE: api/roomtypes/5/amenities/3 - Xóa amenity khỏi RoomType
        [HttpDelete("{amenityId}")]
        public async Task<IActionResult> RemoveAmenity(int roomTypeId, int amenityId)
        {
            if (amenityId <= 0)
                return BadRequest(new { Message = "AmenityId không hợp lệ." });

            var roomTypeAmenity = await _context.RoomTypeAmenities
                .FirstOrDefaultAsync(rta => rta.RoomTypeId == roomTypeId && rta.AmenityId == amenityId);

            if (roomTypeAmenity == null)
                return NotFound(new { Message = "Không tìm thấy amenity thuộc RoomType này." });

            _context.RoomTypeAmenities.Remove(roomTypeAmenity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/roomtypes/5/amenities - XÓA HÀNG LOẠT (bulk delete)
        // Body: [1, 3, 5, 7]  ← mảng các AmenityId cần xoá
        [HttpDelete]
        public async Task<IActionResult> RemoveAmenities(int roomTypeId, [FromBody] List<int> amenityIds)
        {
            if (amenityIds == null || !amenityIds.Any())
                return BadRequest(new { Message = "Danh sách AmenityId cần xoá không được để trống." });

            var roomTypeExists = await _context.RoomTypes
                .AnyAsync(rt => rt.Id == roomTypeId);

            if (!roomTypeExists)
                return NotFound(new { Message = $"RoomType với Id {roomTypeId} không tồn tại." });

            // Lấy ra các bản ghi cần xoá (tránh Contains)
            var toDelete = new List<RoomTypeAmenity>();

            foreach (var id in amenityIds.Distinct())
            {
                var item = await _context.RoomTypeAmenities
                    .FirstOrDefaultAsync(rta => rta.RoomTypeId == roomTypeId && rta.AmenityId == id);

                if (item != null)
                    toDelete.Add(item);
            }

            if (!toDelete.Any())
                return NotFound(new { Message = "Không tìm thấy amenity nào thuộc danh sách cần xoá." });

            _context.RoomTypeAmenities.RemoveRange(toDelete);
            await _context.SaveChangesAsync();

            return NoContent(); // 204 No Content
        }
    }
}