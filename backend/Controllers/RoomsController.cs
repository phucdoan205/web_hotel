using AutoMapper;
using backend.Common;
using backend.Data;
using backend.DTOs.Room;
using backend.Models;
using backend.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;

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
        private readonly IValidator<PatchRoomCleaningStatusDTO> _patchCleaningValidator;
        private readonly IValidator<PatchRoomStatusDTO> _patchStatusValidator;

        public RoomsController(
            AppDbContext context,
            IMapper mapper,
            IValidator<CreateRoomDTO> createValidator,
            IValidator<UpdateRoomDTO> updateValidator,
            IValidator<PatchRoomCleaningStatusDTO> patchCleaningValidator,
            IValidator<PatchRoomStatusDTO> patchStatusValidator)
        {
            _context = context;
            _mapper = mapper;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
            _patchCleaningValidator = patchCleaningValidator;
            _patchStatusValidator = patchStatusValidator;
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
            dto.ID = id;
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

        // DELETE: api/rooms/5 (soft-delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var room = await _context.Rooms
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(r => r.Id == id);

            if (room == null)
                return NotFound();

            if (room.IsDeleted)
                return BadRequest("Phòng đã bị xóa (soft-delete) trước đó.");

            // Business rule: không cho xóa nếu đang có booking active
            var hasActiveBooking = await _context.BookingDetails
                .AnyAsync(bd => bd.RoomId == id
                             && bd.CheckOutDate >= DateTime.UtcNow.Date);

            if (hasActiveBooking)
                return BadRequest("Không thể xóa phòng đang có booking hoạt động.");

            _context.Rooms.Remove(room);  // ← sẽ bị interceptor chuyển thành soft-delete

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/rooms/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreRoom(int id)
        {
            var room = await _context.Rooms
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(r => r.Id == id);

            if (room == null || !room.IsDeleted)
                return NotFound();

            room.IsDeleted = false;
            room.DeletedAt = null;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/rooms/deleted
        [HttpGet("deleted")]
        public async Task<ActionResult<PagedResult<RoomDetailDTO>>> GetDeletedRooms(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15,
            [FromQuery] string? searchRoomNumber = null)
        {
            // Bắt buộc IgnoreQueryFilters để thấy các bản ghi đã soft-delete
            var query = _context.Rooms
                .IgnoreQueryFilters()
                .Where(r => r.IsDeleted == true);

            // Optional: tìm kiếm theo số phòng (nếu client gửi)
            if (!string.IsNullOrWhiteSpace(searchRoomNumber))
            {
                query = query.Where(r => r.RoomNumber.Contains(searchRoomNumber.Trim()));
            }

            // Sắp xếp mặc định
            query = query.OrderByDescending(r => r.DeletedAt);

            // Đếm tổng trước khi phân trang
            var totalCount = await query.CountAsync();

            // Phân trang
            var rooms = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(r => r.RoomType)
                    .ThenInclude(rt => rt!.RoomTypeAmenities)
                    .ThenInclude(rta => rta.Amenity)
                .Include(r => r.RoomInventory)
                .AsNoTracking()
                .ToListAsync();

            var dtos = _mapper.Map<List<RoomDetailDTO>>(rooms);

            var pagedResult = new PagedResponse<RoomDetailDTO>(
                dtos,
                totalCount,
                page,
                pageSize);

            return Ok(pagedResult);
        }

        // GET: api/rooms/available
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

        // PATCH: api/rooms/{id}/status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> PatchStatus(int id, [FromBody] PatchRoomStatusDTO dto)
        {
            var validation = await _patchStatusValidator.ValidateAsync(dto);
            if (!validation.IsValid)
                return BadRequest(validation.Errors);

            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
                return NotFound();

            // Business rule: một số trạng thái không được chuyển trực tiếp
            if (room.Status == RoomStatuses.Occupied && dto.Status != RoomStatuses.Cleaning && dto.Status != RoomStatuses.Maintenance)
            {
                return BadRequest($"Phòng đang {RoomStatuses.Occupied}, chỉ được chuyển sang {RoomStatuses.Cleaning} hoặc {RoomStatuses.Maintenance}");
            }

            room.Status = dto.Status;
            //room.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/rooms/{id}/cleaning-status
        [HttpPatch("{id}/cleaning-status")]
        public async Task<IActionResult> PatchCleaningStatus(int id, [FromBody] PatchRoomCleaningStatusDTO dto)
        {
            var validation = await _patchCleaningValidator.ValidateAsync(dto);
            if (!validation.IsValid)
                return BadRequest(validation.Errors);

            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
                return NotFound();

            // Business rules
            if (dto.CleaningStatus == RoomCleaningStatuses.Clean && room.Status == RoomStatuses.Occupied)
            {
                return BadRequest("Không thể đánh dấu Clean khi phòng đang có khách");
            }

            if (dto.CleaningStatus == RoomCleaningStatuses.Inspected && room.CleaningStatus != RoomCleaningStatuses.Clean)
            {
                return BadRequest("Phòng phải ở trạng thái Clean trước khi chuyển sang Inspected");
            }

            room.CleaningStatus = dto.CleaningStatus;
            room.LastCleaningUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var updatedRoom = await _context.Rooms
                .Include(r => r.RoomType)
                .ThenInclude(rt => rt!.RoomTypeAmenities).ThenInclude(a => a.Amenity)
                .Include(r => r.RoomInventory)
                .FirstOrDefaultAsync(r => r.Id == id);

            var resultDto = _mapper.Map<RoomDetailDTO>(updatedRoom);

            return Ok(resultDto);
        }
    }
}
