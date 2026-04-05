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

            if (!string.IsNullOrWhiteSpace(search))
            {
                var normalized = search.Trim().ToLower();
                query = query.Where(b =>
                    b.BookingCode.ToLower().Contains(normalized) ||
                    (b.Guest != null && b.Guest.Name.ToLower().Contains(normalized)));
            }

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(b => b.Status == status);

            var totalCount = await query.CountAsync();

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
                VoucherId = null,                    // Yêu cầu 2: VoucherID mặc định là null
                BookingCode = $"BK-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
                Status = "Pending"
            };

            decimal totalAmount = 0;

            foreach (var detailDto in dto.BookingDetails)
            {
                // Yêu cầu 4: Lấy PricePerNight từ RoomType
                var roomType = await _context.RoomTypes
                    .FirstOrDefaultAsync(rt => rt.Id == detailDto.RoomTypeId);

                if (roomType == null)
                    return BadRequest($"Loại phòng ID {detailDto.RoomTypeId} không tồn tại.");

                var pricePerNight = roomType.BasePrice;   // Lấy giá từ RoomType

                var detail = new BookingDetail
                {
                    RoomId = detailDto.RoomId,
                    RoomTypeId = detailDto.RoomTypeId,
                    CheckInDate = detailDto.CheckInDate,
                    CheckOutDate = detailDto.CheckOutDate,
                    PricePerNight = pricePerNight
                };

                booking.BookingDetails.Add(detail);
                totalAmount += pricePerNight * (detailDto.CheckOutDate - detailDto.CheckInDate).Days;
            }

            booking.TotalAmount = totalAmount;   // Tính tổng tiền

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

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

        // PATCH: api/Bookings/{id}/status - Cập nhật status (Yêu cầu 1)
        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] BookingStatusUpdateDTO dto)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
                return NotFound("Không tìm thấy booking.");

            booking.Status = dto.Status;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/Bookings/{id}/change-room - Chuyển đổi phòng (Yêu cầu 3)
        [HttpPut("{id:int}/change-room")]
        public async Task<IActionResult> ChangeRoom(int id, [FromBody] ChangeRoomRequestDTO request)
        {
            var bookingDetail = await _context.BookingDetails
                .Include(bd => bd.Booking)
                .Include(bd => bd.RoomType)
                .FirstOrDefaultAsync(bd => bd.Id == request.BookingDetailId && bd.BookingId == id);

            if (bookingDetail == null)
                return NotFound("Không tìm thấy chi tiết booking.");

            // Lấy thông tin phòng mới
            var newRoomType = await _context.RoomTypes.FindAsync(request.NewRoomTypeId);
            if (newRoomType == null)
                return BadRequest("Loại phòng mới không tồn tại.");

            decimal oldPrice = bookingDetail.PricePerNight;
            decimal newPrice = newRoomType.BasePrice;

            // Tính số ngày
            int nights = (bookingDetail.CheckOutDate - bookingDetail.CheckInDate).Days;
            if (nights <= 0) nights = 1;

            decimal oldTotal = oldPrice * nights;
            decimal newTotal = newPrice * nights;

            // Cập nhật
            bookingDetail.RoomTypeId = request.NewRoomTypeId;
            bookingDetail.RoomId = request.NewRoomId;
            bookingDetail.PricePerNight = newPrice;

            // Cập nhật tổng tiền của Booking
            var booking = bookingDetail.Booking;
            booking.TotalAmount = booking.TotalAmount - oldTotal + newTotal;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Chuyển phòng thành công",
                AdditionalAmount = newTotal > oldTotal ? newTotal - oldTotal : 0,
                RefundAmount = newTotal < oldTotal ? oldTotal - newTotal : 0
            });
        }
    }
}