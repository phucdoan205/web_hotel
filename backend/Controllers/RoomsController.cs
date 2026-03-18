using AutoMapper;
using backend.Common;
using backend.Data;
using backend.DTOs.Room;
using backend.Models;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateRoomDTO> _createValidator;
        private readonly IValidator<UpdateRoomDTO> _updateValidator;

        public RoomsController(
            AppDbContext context,
            IMapper mapper,
            IValidator<CreateRoomDTO> createValidator,
            IValidator<UpdateRoomDTO> updateValidator)
        {
            _context = context;
            _mapper = mapper;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        // GET: api/rooms (có filter + pagination)
        [HttpGet]
        public async Task<ActionResult<PagedResult<RoomDetailDTO>>> GetRooms(
        [FromQuery] string? status = null,
        [FromQuery] int? roomTypeId = null,
        [FromQuery] int? floor = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15)
        {
            var query = _context.Rooms
            .Include(r => r.RoomType)
            .ThenInclude(rt => rt!.RoomTypeAmenities)
            .ThenInclude(rta => rta.Amenity)
            .Include(r => r.RoomInventory)
            .AsNoTracking();

            // Áp dụng filter
            if (!string.IsNullOrEmpty(status))
                query = query.Where(r => r.Status == status);

            if (roomTypeId.HasValue)
                query = query.Where(r => r.RoomTypeId == roomTypeId.Value);

            if (floor.HasValue)
                query = query.Where(r => r.Floor == floor.Value);

            // Đếm tổng trước khi phân trang
            var totalCount = await query.CountAsync();

            // Lấy dữ liệu trang hiện tại
            var rooms = await query
                .OrderBy(r => r.RoomNumber)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Map sang DTO (ở đây là List, không phải IQueryable)
            try
            {
                var dtos = _mapper.Map<List<RoomDetailDTO>>(rooms);
                // Tạo PagedResult
                var result = new PagedResponse<RoomDetailDTO>(
                    items: dtos,
                    totalCount: totalCount,
                    page: page,
                    pageSize: pageSize
                );

                return Ok(result);
            }
            catch (AutoMapperMappingException ex)
            {
                return StatusCode(500, new
                {
                    Error = "AutoMapper error",
                    Message = ex.Message,
                    Inner = ex.InnerException?.Message,
                    Stack = ex.InnerException?.StackTrace
                });
            }
        }

        // GET: api/rooms/5 (chi tiết)
        [HttpGet("{id}")]
        public async Task<ActionResult<RoomDetailDTO>> GetRoom(int id)
        {
            var room = await _context.Rooms
                .Include(r => r.RoomType).ThenInclude(rt => rt!.RoomTypeAmenities).ThenInclude(rta => rta.Amenity)
                .Include(r => r.RoomInventory)
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == id);

            if (room == null) return NotFound();

            return Ok(_mapper.Map<RoomDetailDTO>(room));
        }

        // POST: api/rooms
        [HttpPost]
        public async Task<ActionResult<RoomDetailDTO>> Create([FromBody] CreateRoomDTO dto)
        {
            var validation = await _createValidator.ValidateAsync(dto);
            if (!validation.IsValid) return BadRequest(validation.Errors);

            var room = _mapper.Map<Room>(dto);

            // Thêm inventory nếu có
            if (dto.InitialInventories?.Any() == true)
            {
                var inventories = _mapper.Map<List<RoomInventory>>(dto.InitialInventories);
                inventories.ForEach(i => i.Room = room); // hoặc i.RoomId = room.Id sau khi save
                room.RoomInventory = inventories;
            }

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            // Reload để lấy đầy đủ navigation properties
            await _context.Entry(room)
                .Reference(r => r.RoomType)
                .LoadAsync();

            var createdDto = _mapper.Map<RoomDetailDTO>(room);
            return CreatedAtAction(nameof(GetRoom), new { id = room.Id }, createdDto);
        }

        // PUT: api/rooms/5 (partial update)
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRoomDTO dto)
        {
            var validation = await _updateValidator.ValidateAsync(dto);
            if (!validation.IsValid) return BadRequest(validation.Errors);

            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return NotFound();

            _mapper.Map(dto, room); // chỉ map field không null

            // Business rule: không cho đổi số phòng nếu đã có booking
            if (!string.IsNullOrEmpty(dto.RoomNumber) && dto.RoomNumber != room.RoomNumber)
            {
                var hasBooking = await _context.BookingDetails
                    .AnyAsync(bd => bd.RoomId == id && bd.CheckOutDate >= DateTime.Today);
                if (hasBooking) return BadRequest("Phòng đã có đặt phòng, không thể đổi số phòng");
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/rooms/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var room = await _context.Rooms
                .Include(r => r.BookingDetails)
                .Include(r => r.RoomInventory)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (room == null) return NotFound();

            if (room.BookingDetails.Any(b => b.CheckOutDate >= DateTime.Today))
                return BadRequest("Phòng đang có đặt phòng hoạt động, không thể xóa");

            // Xóa inventory trước (nếu có cascade delete thì không cần)
            _context.RoomInventory.RemoveRange(room.RoomInventory);

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // BONUS: Tìm phòng trống theo ngày
        [HttpGet("available")]
        public async Task<ActionResult<List<RoomDetailDTO>>> GetAvailableRooms(
            [FromQuery] DateTime checkIn,
            [FromQuery] DateTime checkOut,
            [FromQuery] int? adults = null,
            [FromQuery] int? children = null)
        {
            if (checkOut <= checkIn) return BadRequest("Check-out phải sau check-in");

            var bookedRoomIds = await _context.BookingDetails
                .Where(bd => bd.CheckInDate < checkOut && bd.CheckOutDate > checkIn)
                .Select(bd => bd.RoomId)
                .Distinct()
                .ToListAsync();

            var query = _context.Rooms
                .Include(r => r.RoomType)
                .ThenInclude(rt => rt!.RoomTypeAmenities).ThenInclude(a => a.Amenity)
                .Include(r => r.RoomInventory)
                .Where(r => r.Status == "Available" && !bookedRoomIds.Contains(r.Id));

            if (adults.HasValue)
                query = query.Where(r => r.RoomType!.CapacityAdults >= adults);
            if (children.HasValue)
                query = query.Where(r => r.RoomType!.CapacityChildren >= children);

            var rooms = await query.ToListAsync();

            return Ok(_mapper.Map<List<RoomDetailDTO>>(rooms));
        }
    }
}
