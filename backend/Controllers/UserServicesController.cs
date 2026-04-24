using backend.Data;
using backend.DTOs.Service;
using backend.Models;
using backend.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/user-services")]
    [Tags("User Services")]
    [Permission]
    public class UserServicesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserServicesController(AppDbContext context)
        {
            _context = context;
        }

        private int? ResolveCurrentUserId()
        {
            var header = Request.Headers["X-User-Id"].ToString();
            if (!string.IsNullOrWhiteSpace(header) && int.TryParse(header, out var headerUserId))
            {
                return headerUserId;
            }

            var claim = User.FindFirst("sub")?.Value
                     ?? User.FindFirst("nameid")?.Value
                     ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            return int.TryParse(claim, out var claimUserId) ? claimUserId : null;
        }

        private static ServiceResponseDTO MapService(Service service) => new()
        {
            Id = service.Id,
            Name = service.Name,
            Price = service.Price,
            Unit = service.Unit,
            Status = service.Status
        };

        private static ServiceUsageResponseDTO MapUsage(OrderServiceDetail detail) => new()
        {
            Id = detail.Id,
            OrderServiceId = detail.OrderServiceId ?? 0,
            BookingId = detail.OrderService?.BookingDetail?.BookingId,
            BookingDetailId = detail.OrderService?.BookingDetailId,
            BookingCode = detail.OrderService?.BookingDetail?.Booking?.BookingCode ?? string.Empty,
            RoomNumber = detail.OrderService?.BookingDetail?.Room?.RoomNumber ?? "--",
            RoomName = detail.OrderService?.BookingDetail?.RoomType?.Name ?? "Phòng",
            GuestName = detail.OrderService?.BookingDetail?.Booking?.Guest?.Name ?? "Khách",
            ServiceId = detail.ServiceId ?? 0,
            ServiceName = detail.Service?.Name ?? "Dịch vụ",
            Quantity = detail.Quantity,
            UnitPrice = detail.UnitPrice,
            LineTotal = detail.UnitPrice * detail.Quantity,
            UsedAt = detail.OrderService?.OrderDate,
            PaymentStatus = string.Equals(detail.OrderService?.Status, "Paid", StringComparison.OrdinalIgnoreCase)
                ? "Paid"
                : "Unpaid"
        };

        [HttpGet("booked-rooms")]
        public async Task<ActionResult<IEnumerable<InHouseRoomResponseDTO>>> GetMyBookedRooms()
        {
            var currentUserId = ResolveCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung hien tai." });
            }

            var rooms = await _context.BookingDetails
                .AsNoTracking()
                .Include(detail => detail.Booking)
                    .ThenInclude(booking => booking!.Guest)
                .Include(detail => detail.Room)
                .Include(detail => detail.RoomType)
                .Where(detail =>
                    detail.Booking != null &&
                    detail.Booking.UserId == currentUserId.Value &&
                    detail.Booking.Status != "Cancelled" &&
                    detail.Status != "Cancelled" &&
                    detail.Status != "CheckedOut" &&
                    detail.Status != "Completed")
                .OrderByDescending(detail => detail.Id)
                .Select(detail => new InHouseRoomResponseDTO
                {
                    BookingId = detail.BookingId ?? 0,
                    BookingDetailId = detail.Id,
                    BookingCode = detail.Booking != null ? detail.Booking.BookingCode : string.Empty,
                    RoomNumber = detail.Room != null ? detail.Room.RoomNumber : "--",
                    RoomName = detail.RoomType != null ? detail.RoomType.Name : "Phòng",
                    GuestName = detail.Booking != null && detail.Booking.Guest != null
                        ? detail.Booking.Guest.Name ?? "Khách"
                        : "Khách",
                    CheckInDate = detail.CheckInDate,
                    CheckOutDate = detail.CheckOutDate,
                    BookingStatus = detail.Booking != null ? detail.Booking.Status ?? string.Empty : string.Empty,
                    DetailStatus = detail.Status ?? string.Empty
                })
                .ToListAsync();

            return Ok(rooms);
        }

        [HttpGet("catalog")]
        public async Task<ActionResult<IEnumerable<ServiceResponseDTO>>> GetActiveServices()
        {
            var services = await _context.Services
                .AsNoTracking()
                .Where(service => service.Status)
                .OrderBy(service => service.Name)
                .ToListAsync();

            return Ok(services.Select(MapService));
        }

        [HttpGet("history")]
        public async Task<ActionResult<IEnumerable<ServiceUsageResponseDTO>>> GetMyServiceHistory(
            [FromQuery] string? paymentStatus = null,
            [FromQuery] int? bookingDetailId = null,
            [FromQuery] string? search = null)
        {
            var currentUserId = ResolveCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung hien tai." });
            }

            var query = _context.OrderServiceDetails
                .AsNoTracking()
                .Include(detail => detail.Service)
                .Include(detail => detail.OrderService)
                    .ThenInclude(order => order!.BookingDetail)
                        .ThenInclude(bookingDetail => bookingDetail!.Booking)
                            .ThenInclude(booking => booking!.Guest)
                .Include(detail => detail.OrderService)
                    .ThenInclude(order => order!.BookingDetail)
                        .ThenInclude(bookingDetail => bookingDetail!.Room)
                .Include(detail => detail.OrderService)
                    .ThenInclude(order => order!.BookingDetail)
                        .ThenInclude(bookingDetail => bookingDetail!.RoomType)
                .Where(detail =>
                    detail.OrderService != null &&
                    detail.OrderService.BookingDetail != null &&
                    detail.OrderService.BookingDetail.Booking != null &&
                    detail.OrderService.BookingDetail.Booking.UserId == currentUserId.Value)
                .AsQueryable();

            if (bookingDetailId.HasValue)
            {
                query = query.Where(detail => detail.OrderService != null && detail.OrderService.BookingDetailId == bookingDetailId.Value);
            }

            if (!string.IsNullOrWhiteSpace(paymentStatus))
            {
                var normalizedStatus = paymentStatus.Trim().ToLowerInvariant();
                if (normalizedStatus == "paid")
                {
                    query = query.Where(detail => detail.OrderService != null && detail.OrderService.Status == "Paid");
                }
                else if (normalizedStatus == "unpaid")
                {
                    query = query.Where(detail => detail.OrderService == null || detail.OrderService.Status != "Paid");
                }
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var normalizedSearch = search.Trim().ToLowerInvariant();
                query = query.Where(detail =>
                    (detail.Service != null && detail.Service.Name.ToLower().Contains(normalizedSearch)) ||
                    (detail.OrderService != null &&
                        detail.OrderService.BookingDetail != null &&
                        ((detail.OrderService.BookingDetail.Room != null &&
                          detail.OrderService.BookingDetail.Room.RoomNumber.ToLower().Contains(normalizedSearch)) ||
                         (detail.OrderService.BookingDetail.Booking != null &&
                          detail.OrderService.BookingDetail.Booking.BookingCode.ToLower().Contains(normalizedSearch)) ||
                         (detail.OrderService.BookingDetail.Booking != null &&
                          detail.OrderService.BookingDetail.Booking.Guest != null &&
                          (detail.OrderService.BookingDetail.Booking.Guest.Name ?? string.Empty).ToLower().Contains(normalizedSearch)))));
            }

            var items = await query
                .OrderByDescending(detail => detail.OrderService != null ? detail.OrderService.OrderDate : DateTime.MinValue)
                .ThenByDescending(detail => detail.Id)
                .ToListAsync();

            return Ok(items.Select(MapUsage));
        }

        [HttpPost("apply")]
        public async Task<ActionResult<ServiceUsageResponseDTO>> ApplyMyService([FromBody] ApplyServiceDTO request)
        {
            var currentUserId = ResolveCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung hien tai." });
            }

            if (!request.BookingDetailId.HasValue || !request.ServiceId.HasValue)
            {
                return BadRequest("Thiếu phòng hoặc dịch vụ cần áp dụng.");
            }

            if (request.Quantity <= 0)
            {
                return BadRequest("Số lượng phải lớn hơn 0.");
            }

            var bookingDetail = await _context.BookingDetails
                .Include(detail => detail.Booking)
                    .ThenInclude(booking => booking!.Guest)
                .Include(detail => detail.Room)
                .Include(detail => detail.RoomType)
                .FirstOrDefaultAsync(detail =>
                    detail.Id == request.BookingDetailId.Value &&
                    detail.Booking != null &&
                    detail.Booking.UserId == currentUserId.Value);

            if (bookingDetail == null)
            {
                return NotFound("Không tìm thấy phòng thuộc booking của bạn.");
            }

            if (!string.Equals(bookingDetail.Status, "CheckedIn", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Chỉ có thể áp dụng dịch vụ cho phòng đang ở trạng thái đã nhận phòng.");
            }

            var service = await _context.Services.FirstOrDefaultAsync(item => item.Id == request.ServiceId.Value && item.Status);
            if (service == null)
            {
                return NotFound("Không tìm thấy dịch vụ đang hoạt động.");
            }

            var orderService = new OrderService
            {
                BookingDetailId = bookingDetail.Id,
                OrderDate = DateTime.UtcNow,
                Status = "Unpaid",
                TotalAmount = service.Price * request.Quantity
            };

            var orderServiceDetail = new OrderServiceDetail
            {
                ServiceId = service.Id,
                Quantity = request.Quantity,
                UnitPrice = service.Price,
                OrderService = orderService
            };

            _context.OrderServices.Add(orderService);
            _context.OrderServiceDetails.Add(orderServiceDetail);
            await _context.SaveChangesAsync();

            orderService.BookingDetail = bookingDetail;
            orderServiceDetail.OrderServiceId = orderService.Id;
            orderServiceDetail.OrderService = orderService;
            orderServiceDetail.Service = service;

            return Created($"/api/user-services/history?bookingDetailId={bookingDetail.Id}", MapUsage(orderServiceDetail));
        }
    }
}
