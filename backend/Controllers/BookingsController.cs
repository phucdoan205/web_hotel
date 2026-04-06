using AutoMapper;
using backend.Common;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Tags("Bookings")]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public BookingsController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/Bookings
        [HttpGet]
        public async Task<ActionResult<PagedResponse<BookingResponseDTO>>> GetBookings(
    [FromQuery] string? search = null,
    [FromQuery] string? status = null,
    [FromQuery] string? roomTypeId = null,      // Lọc theo loại phòng
    [FromQuery] DateTime? checkInFrom = null,   // Lọc theo ngày check-in từ
    [FromQuery] DateTime? checkInTo = null,     // Lọc theo ngày check-in đến
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
        {
            var query = _context.Bookings
                .Include(b => b.Guest)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.Room)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.RoomType)
                .AsNoTracking();

            // 1. Tìm kiếm (BookingCode, Tên khách, Số phòng)
            if (!string.IsNullOrWhiteSpace(search))
            {
                var normalized = search.Trim().ToLower();
                query = query.Where(b =>
                    b.BookingCode.ToLower().Contains(normalized) ||
                    (b.Guest != null && b.Guest.Name.ToLower().Contains(normalized)) ||
                    b.BookingDetails.Any(bd => bd.Room != null &&
                        bd.Room.RoomNumber.ToLower().Contains(normalized)));
            }

            // 2. Lọc theo Status
            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(b => b.Status == status);
            }

            // 3. Lọc theo Loại phòng (RoomTypeId)
            if (!string.IsNullOrWhiteSpace(roomTypeId) && int.TryParse(roomTypeId, out int rtId))
            {
                query = query.Where(b => b.BookingDetails.Any(bd => bd.RoomTypeId == rtId));
            }

            // 4. Lọc theo ngày Check-in
            if (checkInFrom.HasValue)
            {
                var fromDate = checkInFrom.Value.Date;
                query = query.Where(b => b.BookingDetails.Any(bd => bd.CheckInDate.Date >= fromDate));
            }

            if (checkInTo.HasValue)
            {
                var toDate = checkInTo.Value.Date;
                query = query.Where(b => b.BookingDetails.Any(bd => bd.CheckInDate.Date <= toDate));
            }

            // Đếm tổng số bản ghi
            var totalCount = await query.CountAsync();

            // Lấy dữ liệu + phân trang (giữ nguyên OrderByDescending(b => b.Id) như code gốc)
            var bookings = await query
                .OrderByDescending(b => b.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = _mapper.Map<List<BookingResponseDTO>>(bookings);

            return Ok(new PagedResponse<BookingResponseDTO>(dtos, totalCount, page, pageSize));
        }

        // GET: api/Bookings/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<BookingResponseDTO>> GetBooking(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.Guest)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.Room)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.RoomType)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return NotFound();

            return Ok(_mapper.Map<BookingResponseDTO>(booking));
        }

        // POST: api/Bookings - Tạo booking mới
        [HttpPost]
        public async Task<ActionResult<BookingResponseDTO>> CreateBooking([FromBody] BookingCreateDTO dto)
        {
            if (dto.BookingDetails == null || !dto.BookingDetails.Any())
                return BadRequest("Phải có ít nhất một chi tiết phòng.");

            var guestExists = await _context.Guests.AnyAsync(g => g.Id == dto.GuestId);
            if (!guestExists)
                return BadRequest("Khách hàng không tồn tại.");

            var booking = new Booking
            {
                UserId = dto.UserId,
                GuestId = dto.GuestId,
                VoucherId = null,                    // Mặc định là null
                BookingCode = $"BK-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
                Status = "Pending"
            };

            foreach (var detailDto in dto.BookingDetails)
            {
                // Lấy giá từ RoomType (Yêu cầu 4)
                var roomType = await _context.RoomTypes
                    .AsNoTracking()
                    .FirstOrDefaultAsync(rt => rt.Id == detailDto.RoomTypeId);

                if (roomType == null)
                    return BadRequest($"Loại phòng ID {detailDto.RoomTypeId} không tồn tại.");

                var detail = new BookingDetail
                {
                    RoomId = detailDto.RoomId,
                    RoomTypeId = detailDto.RoomTypeId,
                    CheckInDate = detailDto.CheckInDate,
                    CheckOutDate = detailDto.CheckOutDate,
                    PricePerNight = roomType.BasePrice   // Lấy giá từ RoomType
                };

                booking.BookingDetails.Add(detail);
            }

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            // Load lại để trả về
            var created = await _context.Bookings
                .Include(b => b.Guest)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.Room)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.RoomType)
                .FirstAsync(b => b.Id == booking.Id);

            return CreatedAtAction(nameof(GetBooking), new { id = booking.Id },
                _mapper.Map<BookingResponseDTO>(created));
        }

        // PATCH: api/Bookings/{id}/status - Cập nhật status
        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] BookingStatusUpdateDTO dto)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return NotFound("Không tìm thấy booking.");

            booking.Status = dto.Status;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/Bookings/{id}/change-room - Chuyển đổi phòng (tính tiền chênh lệch)
        [HttpPut("{id:int}/change-room")]
        public async Task<ActionResult<object>> ChangeRoom(int id, [FromBody] ChangeRoomRequestDTO request)
        {
            var bookingDetail = await _context.BookingDetails
                .Include(bd => bd.Booking)
                .Include(bd => bd.RoomType)
                .FirstOrDefaultAsync(bd => bd.Id == request.BookingDetailId && bd.BookingId == id);

            if (bookingDetail == null)
                return NotFound("Không tìm thấy chi tiết booking.");

            var newRoomType = await _context.RoomTypes.FindAsync(request.NewRoomTypeId);
            if (newRoomType == null)
                return BadRequest("Loại phòng mới không tồn tại.");

            int nights = (bookingDetail.CheckOutDate - bookingDetail.CheckInDate).Days;
            if (nights <= 0) nights = 1;

            decimal oldPriceTotal = bookingDetail.PricePerNight * nights;
            decimal newPriceTotal = newRoomType.BasePrice * nights;

            // Cập nhật thông tin phòng mới
            bookingDetail.RoomTypeId = request.NewRoomTypeId;
            bookingDetail.RoomId = request.NewRoomId;
            bookingDetail.PricePerNight = newRoomType.BasePrice;

            await _context.SaveChangesAsync();

            decimal difference = newPriceTotal - oldPriceTotal;

            return Ok(new
            {
                message = "Chuyển phòng thành công",
                oldPricePerNight = bookingDetail.PricePerNight, // giá cũ
                newPricePerNight = newRoomType.BasePrice,
                nights = nights,
                amountDifference = difference,   // > 0 = phải bù, < 0 = được hoàn
                isAdditionalPayment = difference > 0
            });
        }
    }
}