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

            // ====================== XỬ LÝ GUEST - TẠO MỚI NẾU CHƯA CÓ ======================
            int guestId;

            // Trường hợp 1: Client truyền GuestId rõ ràng
            if (dto.GuestId.HasValue && dto.GuestId.Value > 0)
            {
                var existingGuest = await _context.Guests
                    .AnyAsync(g => g.Id == dto.GuestId.Value);

                if (!existingGuest)
                    return BadRequest($"Khách hàng ID {dto.GuestId.Value} không tồn tại.");

                guestId = dto.GuestId.Value;
            }
            else
            {
                // Trường hợp 2: Không truyền GuestId -> Kiểm tra GuestPhone đã tồn tại hay không
                if (string.IsNullOrWhiteSpace(dto.GuestName))
                    return BadRequest("Tên khách hàng là bắt buộc khi tạo khách mới (GuestName).");

                var existingGuest = await _context.Guests
                    .FirstOrDefaultAsync(g => g.Phone == dto.GuestPhone);

                if (existingGuest != null)
                {
                    guestId = existingGuest.Id;
                }
                else
                {
                    var newGuest = new Guest
                    {
                        Name = dto.GuestName.Trim(),
                        Phone = string.IsNullOrWhiteSpace(dto.GuestPhone) ? null : dto.GuestPhone.Trim(),
                        Email = string.IsNullOrWhiteSpace(dto.GuestEmail) ? null : dto.GuestEmail.Trim()
                    };

                    _context.Guests.Add(newGuest);
                    await _context.SaveChangesAsync();        // ← Save để lấy ID

                    guestId = newGuest.Id;
                }
            }

            // ====================== TẠO BOOKING ======================
            var booking = new Booking
            {
                UserId = dto.UserId,
                GuestId = guestId,
                VoucherId = dto.VoucherId,
                BookingCode = $"BK-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
                Status = "Pending"
            };

            foreach (var detailDto in dto.BookingDetails)
            {
                var roomType = await _context.RoomTypes
                    .AsNoTracking()
                    .FirstOrDefaultAsync(rt => rt.Id == detailDto.RoomTypeId);

                if (roomType == null)
                    return BadRequest($"Loại phòng ID {detailDto.RoomTypeId} không tồn tại.");

                var detail = new BookingDetail
                {
                    RoomId = detailDto.RoomId,
                    RoomTypeId = detailDto.RoomTypeId,
                    CheckInDate = detailDto.CheckInDate.AddHours(14),   // Mặc định giờ check-in là 14:00
                    CheckOutDate = detailDto.CheckOutDate.AddHours(12), // Mặc định giờ check-out là 12:00
                    PricePerNight = roomType.BasePrice
                };

                booking.BookingDetails.Add(detail);
            }

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            // Load đầy đủ để trả về (bao gồm Guest.Name)
            var created = await _context.Bookings
                .Include(b => b.Guest)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.Room)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.RoomType)
                .AsNoTracking()
                .FirstAsync(b => b.Id == booking.Id);

            var responseDto = _mapper.Map<BookingResponseDTO>(created);

            return CreatedAtAction(nameof(CreateBooking), new { id = booking.Id }, responseDto);
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

        // PATCH: api/Bookings/{id}/check-in - Check-in khách
        [HttpPatch("{id:int}/check-in")]
        public async Task<IActionResult> CheckIn(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
                return NotFound("Không tìm thấy booking.");

            if (booking.Status != "Confirmed")
                return BadRequest("Chỉ có thể check-in cho booking có trạng thái 'Confirmed'.");

            // Cập nhật trạng thái Booking
            booking.Status = "CheckedIn";

            // Cập nhật trạng thái các phòng liên quan thành Occupied
            foreach (var detail in booking.BookingDetails)
            {
                if (detail.RoomId.HasValue)
                {
                    var room = await _context.Rooms.FindAsync(detail.RoomId.Value);
                    if (room != null)
                    {
                        room.Status = RoomStatuses.Occupied;
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Khách đã được check-in thành công.",
                bookingId = booking.Id,
                newStatus = booking.Status
            });
        }

        // PATCH: api/Bookings/{id}/check-out - Check-out khách
        [HttpPatch("{id:int}/check-out")]
        public async Task<IActionResult> CheckOut(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
                return NotFound("Không tìm thấy booking.");

            if (booking.Status != "CheckedIn")
                return BadRequest("Chỉ có thể check-out cho booking có trạng thái 'CheckedIn'.");

            // Cập nhật trạng thái Booking
            booking.Status = "Completed";

            // Cập nhật trạng thái các phòng liên quan thành Available
            foreach (var detail in booking.BookingDetails)
            {
                if (detail.RoomId.HasValue)
                {
                    var room = await _context.Rooms.FindAsync(detail.RoomId.Value);
                    if (room != null)
                    {
                        room.Status = RoomStatuses.Available;
                        // Có thể cập nhật CleaningStatus nếu cần
                        // room.CleaningStatus = RoomCleaningStatuses.Dirty;
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Khách đã được check-out thành công.",
                bookingId = booking.Id,
                newStatus = booking.Status
            });
        }

        // PATCH: api/Bookings/{id}/cancel - Hủy booking
        [HttpPatch("{id:int}/cancel")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
                return NotFound("Không tìm thấy booking.");

            if (booking.Status == "Cancelled")
                return BadRequest("Booking này đã bị hủy trước đó.");

            if (booking.Status == "Completed" || booking.Status == "CheckedIn")
                return BadRequest("Không thể hủy booking đã check-in hoặc hoàn thành.");

            // 1. Đổi trạng thái Booking thành Cancelled
            booking.Status = "Cancelled";

            // 2. Giải phóng các phòng đang Occupied thuộc booking này
            foreach (var detail in booking.BookingDetails)
            {
                if (detail.RoomId.HasValue)
                {
                    var room = await _context.Rooms.FindAsync(detail.RoomId.Value);
                    if (room != null && room.Status == RoomStatuses.Occupied)
                    {
                        room.Status = RoomStatuses.Available;
                        // Có thể cập nhật CleaningStatus nếu cần
                        // room.CleaningStatus = RoomCleaningStatuses.Dirty;
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Booking đã được hủy thành công.",
                bookingId = booking.Id,
                newStatus = booking.Status
            });
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

        // GET: api/Bookings/arrivals - Khách đến hôm nay
        [HttpGet("arrivals")]
        public async Task<ActionResult<PagedResponse<BookingResponseDTO>>> GetArrivals(
            [FromQuery] DateTime? date = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var targetDate = date?.Date ?? DateTime.UtcNow.Date;

            var query = _context.Bookings
                .Include(b => b.Guest)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.Room)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.RoomType)
                .Where(b => b.Status == "Confirmed" || b.Status == "Pending")
                .Where(b => b.BookingDetails.Any(bd =>
                    bd.CheckInDate.Date == targetDate))
                .AsNoTracking();

            var totalCount = await query.CountAsync();

            var bookings = await query
                .OrderBy(b => b.BookingDetails.Min(bd => bd.CheckInDate))
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = _mapper.Map<List<BookingResponseDTO>>(bookings);

            return Ok(new PagedResponse<BookingResponseDTO>(dtos, totalCount, page, pageSize));
        }

        // GET: api/Bookings/in-house - Khách đang lưu trú
        [HttpGet("in-house")]
        public async Task<ActionResult<PagedResponse<BookingResponseDTO>>> GetInHouse(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Bookings
                .Include(b => b.Guest)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.Room)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.RoomType)
                .Where(b => b.Status == "CheckedIn")
                .AsNoTracking();

            var totalCount = await query.CountAsync();

            var bookings = await query
                .OrderByDescending(b => b.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = _mapper.Map<List<BookingResponseDTO>>(bookings);

            return Ok(new PagedResponse<BookingResponseDTO>(dtos, totalCount, page, pageSize));
        }

        // GET: api/Bookings/departures - Khách dự kiến check-out hôm nay
        [HttpGet("departures")]
        public async Task<ActionResult<PagedResponse<BookingResponseDTO>>> GetDepartures(
            [FromQuery] DateTime? date = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var targetDate = date?.Date ?? DateTime.UtcNow.Date;

            var query = _context.Bookings
                .Include(b => b.Guest)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.Room)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.RoomType)
                .Where(b => b.Status == "CheckedIn")
                .Where(b => b.BookingDetails.Any(bd => bd.CheckOutDate.Date == targetDate))
                .AsNoTracking();

            var totalCount = await query.CountAsync();

            var bookings = await query
                .OrderBy(b => b.BookingDetails.Min(bd => bd.CheckOutDate))
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = _mapper.Map<List<BookingResponseDTO>>(bookings);

            return Ok(new PagedResponse<BookingResponseDTO>(dtos, totalCount, page, pageSize));
        }
    }
}