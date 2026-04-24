using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using AutoMapper;
using backend.Common;
using backend.Data;
using backend.DTOs;
using backend.DTOs.Invoice;
using backend.DTOs.Payment;
using backend.DTOs.Review;
using backend.DTOs.UserBooking;
using backend.Models;
using backend.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/user-bookings")]
    [Tags("User Bookings")]
    [Permission]
    public class UserBookingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<UserBookingsController> _logger;

        private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

        public UserBookingsController(
            AppDbContext context,
            IMapper mapper,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            ILogger<UserBookingsController> logger)
        {
            _context = context;
            _mapper = mapper;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
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

        private async Task<User?> ResolveCurrentUserAsync()
        {
            var userId = ResolveCurrentUserId();
            if (!userId.HasValue)
            {
                return null;
            }

            return await _context.Users.AsNoTracking().FirstOrDefaultAsync(item => item.Id == userId.Value);
        }

        private IQueryable<Booking> BuildOwnedBookingsQuery(int userId)
        {
            return _context.Bookings
                .Where(item => item.UserId == userId)
                .Include(item => item.Guest)
                .Include(item => item.BookingDetails)
                    .ThenInclude(detail => detail.Room)
                .Include(item => item.BookingDetails)
                    .ThenInclude(detail => detail.RoomType);
        }

        private static string ResolveBookingStatusFromDetails(IEnumerable<BookingDetail> details)
        {
            var detailList = details.ToList();
            if (!detailList.Any()) return "Pending";

            if (detailList.All(detail => detail.Status == "Completed"))
            {
                return "Completed";
            }

            if (detailList.All(detail => detail.Status == "Cancelled"))
            {
                return "Cancelled";
            }

            if (detailList.Any(detail => detail.Status == "Paying"))
            {
                return "Paying";
            }

            return "Pending";
        }

        private async Task ApplyInvoicePaymentStatusesAsync(IEnumerable<Booking> bookings)
        {
            var bookingList = bookings.Where(booking => booking != null).ToList();
            if (!bookingList.Any())
            {
                return;
            }

            var detailIds = bookingList
                .SelectMany(booking => booking.BookingDetails ?? Enumerable.Empty<BookingDetail>())
                .Select(detail => detail.Id)
                .Where(id => id > 0)
                .Distinct()
                .ToList();

            if (!detailIds.Any())
            {
                return;
            }

            var payingDetailIds = await _context.Invoices
                .AsNoTracking()
                .Where(invoice =>
                    invoice.BookingDetailId.HasValue &&
                    detailIds.Contains(invoice.BookingDetailId.Value) &&
                    invoice.Status == "Paying")
                .Select(invoice => invoice.BookingDetailId!.Value)
                .Distinct()
                .ToListAsync();

            if (!payingDetailIds.Any())
            {
                return;
            }

            var payingDetailIdSet = payingDetailIds.ToHashSet();

            foreach (var booking in bookingList)
            {
                foreach (var detail in booking.BookingDetails.Where(detail => payingDetailIdSet.Contains(detail.Id)))
                {
                    if (!string.Equals(detail.Status, "Completed", StringComparison.OrdinalIgnoreCase))
                    {
                        detail.Status = "Paying";
                    }
                }

                booking.Status = ResolveBookingStatusFromDetails(booking.BookingDetails);
            }
        }

        private static string GenerateBookingCode(string? guestPhone, DateTime timestamp)
        {
            var digitsOnly = new string((guestPhone ?? string.Empty).Where(char.IsDigit).ToArray());
            var phoneSuffix = digitsOnly.Length >= 3
                ? digitsOnly[^3..]
                : digitsOnly.PadLeft(3, '0');

            return $"BK-{timestamp:yyyyMMddHHmm}{phoneSuffix}";
        }

        private static DateTime NormalizeCheckInDate(DateTime value)
        {
            return value.TimeOfDay == TimeSpan.Zero
                ? value.Date.AddHours(14)
                : value;
        }

        private static DateTime NormalizeCheckOutDate(DateTime value)
        {
            return value.TimeOfDay == TimeSpan.Zero
                ? value.Date.AddHours(12)
                : value;
        }

        private static DateTime GetVietnamTime(DateTime utcNow)
        {
            try
            {
                var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
                return TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utcNow, DateTimeKind.Utc), vietnamTimeZone);
            }
            catch (TimeZoneNotFoundException)
            {
                var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh");
                return TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utcNow, DateTimeKind.Utc), vietnamTimeZone);
            }
        }

        private static string GenerateInvoiceCode(string? roomNumber, DateTime createdAtUtc)
        {
            var normalizedRoomNumber = string.IsNullOrWhiteSpace(roomNumber)
                ? "ROOM"
                : roomNumber.Trim().Replace(" ", string.Empty).ToUpperInvariant();
            var vietnamNow = GetVietnamTime(createdAtUtc);

            return $"HD-{vietnamNow:yyyyMMdd}-{normalizedRoomNumber}-{vietnamNow:HHmm}";
        }

        private static int CalculateStayedDays(BookingDetail detail)
        {
            var stayedDays = (detail.CheckOutDate.Date - detail.CheckInDate.Date).Days;
            return stayedDays <= 0 ? 1 : stayedDays;
        }

        private static UserBookingPaymentSummaryDTO BuildPaymentSummary(Booking booking, IEnumerable<Invoice> invoices)
        {
            var invoiceItems = invoices
                .OrderBy(item => item.Id)
                .Select(item => new UserBookingPaymentInvoiceItemDTO
                {
                    InvoiceId = item.Id,
                    BookingDetailId = item.BookingDetailId,
                    InvoiceCode = item.Code,
                    RoomName = item.RoomName ?? "Phong",
                    RoomNumber = item.RoomNumber ?? "--",
                    TotalAmount = item.FinalTotal ?? 0,
                    Status = item.Status ?? "Paying"
                })
                .ToList();

            return new UserBookingPaymentSummaryDTO
            {
                BookingId = booking.Id,
                BookingCode = booking.BookingCode,
                Status = booking.Status ?? "Pending",
                TotalAmount = invoiceItems.Sum(item => item.TotalAmount),
                Items = invoiceItems
            };
        }

        private async Task<List<Invoice>> EnsureCheckoutInvoicesAsync(Booking booking)
        {
            var checkedOutDetailIds = booking.BookingDetails
                .Where(detail => string.Equals(detail.Status, "CheckedOut", StringComparison.OrdinalIgnoreCase) ||
                                 string.Equals(detail.Status, "Paying", StringComparison.OrdinalIgnoreCase))
                .Select(detail => detail.Id)
                .ToList();

            if (!checkedOutDetailIds.Any())
            {
                return new List<Invoice>();
            }

            var existingInvoices = await _context.Invoices
                .Where(invoice =>
                    invoice.BookingId == booking.Id &&
                    invoice.BookingDetailId.HasValue &&
                    checkedOutDetailIds.Contains(invoice.BookingDetailId.Value) &&
                    invoice.Status != "Completed")
                .ToListAsync();

            var existingByDetailId = existingInvoices
                .Where(invoice => invoice.BookingDetailId.HasValue)
                .ToDictionary(invoice => invoice.BookingDetailId!.Value, invoice => invoice);

            var createdAt = DateTime.UtcNow;

            foreach (var detail in booking.BookingDetails.Where(detail =>
                         string.Equals(detail.Status, "CheckedOut", StringComparison.OrdinalIgnoreCase) ||
                         string.Equals(detail.Status, "Paying", StringComparison.OrdinalIgnoreCase)))
            {
                if (existingByDetailId.ContainsKey(detail.Id))
                {
                    detail.Status = "Paying";
                    continue;
                }

                var stayedDays = CalculateStayedDays(detail);
                var totalRoomAmount = detail.PricePerNight * stayedDays;
                var totalServiceAmount = await _context.OrderServiceDetails
                    .AsNoTracking()
                    .Where(item =>
                        item.OrderService != null &&
                        item.OrderService.BookingDetailId == detail.Id &&
                        item.OrderService.Status != "Paid")
                    .SumAsync(item => (decimal?)(item.Quantity * item.UnitPrice)) ?? 0;

                var invoice = new Invoice
                {
                    BookingId = booking.Id,
                    BookingDetailId = detail.Id,
                    Code = GenerateInvoiceCode(detail.Room?.RoomNumber, createdAt),
                    BookingCode = booking.BookingCode,
                    GuestName = booking.Guest?.Name,
                    RoomNumber = detail.Room?.RoomNumber ?? "--",
                    RoomName = detail.RoomType?.Name ?? "Phong",
                    RoomRate = detail.PricePerNight,
                    CheckInDate = detail.CheckInDate,
                    CheckOutDate = detail.CheckOutDate,
                    StayedDays = stayedDays,
                    TotalRoomAmount = totalRoomAmount,
                    TotalServiceAmount = totalServiceAmount,
                    DiscountAmount = 0,
                    TaxAmount = 0,
                    FinalTotal = Math.Max(0, totalRoomAmount + totalServiceAmount),
                    Status = "Paying",
                    CreatedAt = createdAt,
                    UpdatedAt = createdAt
                };

                _context.Invoices.Add(invoice);
                existingInvoices.Add(invoice);
                existingByDetailId[detail.Id] = invoice;
                detail.Status = "Paying";
            }

            booking.Status = "Paying";

            return existingInvoices;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResponse<BookingResponseDTO>>> GetMyBookings(
            [FromQuery] string? search = null,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var currentUser = await ResolveCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung hien tai." });
            }

            page = page < 1 ? 1 : page;
            pageSize = pageSize switch
            {
                < 1 => 10,
                > 100 => 100,
                _ => pageSize
            };

            var query = BuildOwnedBookingsQuery(currentUser.Id).AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var normalizedSearch = search.Trim().ToLower();
                query = query.Where(item =>
                    item.BookingCode.ToLower().Contains(normalizedSearch) ||
                    item.BookingDetails.Any(detail =>
                        (detail.RoomType != null && detail.RoomType.Name.ToLower().Contains(normalizedSearch)) ||
                        (detail.Room != null && detail.Room.RoomNumber.ToLower().Contains(normalizedSearch))));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(item => item.Status == status);
            }

            if (fromDate.HasValue)
            {
                var normalizedFromDate = fromDate.Value.Date;
                query = query.Where(item =>
                    item.BookingDetails.Any(detail => detail.CheckInDate.Date >= normalizedFromDate));
            }

            if (toDate.HasValue)
            {
                var normalizedToDate = toDate.Value.Date;
                query = query.Where(item =>
                    item.BookingDetails.Any(detail => detail.CheckInDate.Date <= normalizedToDate));
            }

            var totalCount = await query.CountAsync();
            var bookings = await query
                .OrderByDescending(item => item.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            await ApplyInvoicePaymentStatusesAsync(bookings);

            var dtos = _mapper.Map<List<BookingResponseDTO>>(bookings);
            return Ok(new PagedResponse<BookingResponseDTO>(dtos, totalCount, page, pageSize));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<BookingResponseDTO>> GetMyBooking(int id)
        {
            var currentUser = await ResolveCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung hien tai." });
            }

            var booking = await BuildOwnedBookingsQuery(currentUser.Id)
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == id);

            if (booking == null)
            {
                return NotFound(new { message = "Khong tim thay booking cua ban." });
            }

            await ApplyInvoicePaymentStatusesAsync(new[] { booking });

            return Ok(_mapper.Map<BookingResponseDTO>(booking));
        }

        [HttpPost]
        public async Task<ActionResult<BookingResponseDTO>> CreateMyBooking([FromBody] BookingCreateDTO dto)
        {
            var currentUser = await ResolveCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung hien tai." });
            }

            if (dto.BookingDetails == null || !dto.BookingDetails.Any())
            {
                return BadRequest(new { message = "Phai co it nhat mot chi tiet phong." });
            }

            var guest = await _context.Guests.FirstOrDefaultAsync(item => item.Phone == currentUser.Phone);
            if (guest == null)
            {
                guest = new Guest
                {
                    Name = currentUser.FullName.Trim(),
                    Phone = string.IsNullOrWhiteSpace(currentUser.Phone) ? null : currentUser.Phone.Trim(),
                    Email = string.IsNullOrWhiteSpace(currentUser.Email) ? null : currentUser.Email.Trim()
                };

                _context.Guests.Add(guest);
                await _context.SaveChangesAsync();
            }

            var booking = new Booking
            {
                UserId = currentUser.Id,
                GuestId = guest.Id,
                VoucherId = dto.VoucherId,
                BookingCode = GenerateBookingCode(currentUser.Phone, DateTime.Now),
                Status = "Pending"
            };

            foreach (var detailDto in dto.BookingDetails)
            {
                var roomType = await _context.RoomTypes
                    .AsNoTracking()
                    .FirstOrDefaultAsync(item => item.Id == detailDto.RoomTypeId);

                if (roomType == null)
                {
                    return BadRequest(new { message = $"Loai phong ID {detailDto.RoomTypeId} khong ton tai." });
                }

                var detail = new BookingDetail
                {
                    RoomId = detailDto.RoomId,
                    RoomTypeId = detailDto.RoomTypeId,
                    CheckInDate = NormalizeCheckInDate(detailDto.CheckInDate),
                    CheckOutDate = NormalizeCheckOutDate(detailDto.CheckOutDate),
                    PricePerNight = roomType.BasePrice,
                    Status = "Pending"
                };

                booking.BookingDetails.Add(detail);
            }

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            var created = await BuildOwnedBookingsQuery(currentUser.Id)
                .AsNoTracking()
                .FirstAsync(item => item.Id == booking.Id);

            return CreatedAtAction(nameof(GetMyBooking), new { id = booking.Id }, _mapper.Map<BookingResponseDTO>(created));
        }

        [HttpPatch("{id:int}/cancel")]
        public async Task<IActionResult> CancelMyBooking(int id)
        {
            var currentUser = await ResolveCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung hien tai." });
            }

            var booking = await BuildOwnedBookingsQuery(currentUser.Id)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (booking == null)
            {
                return NotFound(new { message = "Khong tim thay booking cua ban." });
            }

            if (booking.Status == "Cancelled")
            {
                return BadRequest(new { message = "Booking nay da bi huy truoc do." });
            }

            if (booking.Status == "Completed" || booking.BookingDetails.Any(detail =>
                    detail.Status == "Confirmed" ||
                    detail.Status == "CheckedIn" ||
                    detail.Status == "CheckedOut" ||
                    detail.Status == "Completed"))
            {
                return BadRequest(new { message = "Khong the huy booking da thanh toan hoac dang luu tru." });
            }

            booking.Status = "Cancelled";
            foreach (var detail in booking.BookingDetails.Where(detail => detail.Status != "Completed"))
            {
                detail.Status = "Cancelled";
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Booking da duoc huy thanh cong.",
                bookingId = booking.Id,
                newStatus = booking.Status
            });
        }

        [HttpPatch("{id:int}/check-out")]
        public async Task<ActionResult<UserBookingCheckOutResponseDTO>> CheckOutMyBooking(int id)
        {
            var currentUser = await ResolveCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung hien tai." });
            }

            var booking = await BuildOwnedBookingsQuery(currentUser.Id)
                .Include(item => item.BookingDetails)
                    .ThenInclude(detail => detail.OrderServices)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (booking == null)
            {
                return NotFound(new { message = "Khong tim thay booking cua ban." });
            }

            var checkedInDetails = booking.BookingDetails
                .Where(detail => string.Equals(detail.Status, "CheckedIn", StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (!checkedInDetails.Any())
            {
                return BadRequest(new { message = "Chi co the tra phong cho booking dang o trang thai CheckedIn." });
            }

            foreach (var detail in checkedInDetails)
            {
                if (detail.RoomId.HasValue)
                {
                    var room = await _context.Rooms.FirstOrDefaultAsync(item => item.Id == detail.RoomId.Value);
                    if (room != null)
                    {
                        room.Status = RoomStatuses.Available;
                        room.CleaningStatus = RoomCleaningStatuses.Dirty;
                    }
                }

                detail.Status = "CheckedOut";
            }

            var invoices = await EnsureCheckoutInvoicesAsync(booking);
            await _context.SaveChangesAsync();

            return Ok(new UserBookingCheckOutResponseDTO
            {
                Message = "Da xac nhan tra phong. Booking da chuyen sang Paying.",
                BookingId = booking.Id,
                BookingStatus = booking.Status ?? "Paying",
                InvoiceIds = invoices.Select(item => item.Id).ToList()
            });
        }

        [HttpGet("{id:int}/payment-summary")]
        public async Task<ActionResult<UserBookingPaymentSummaryDTO>> GetMyBookingPaymentSummary(
            int id,
            [FromQuery] int? bookingDetailId = null)
        {
            var currentUser = await ResolveCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung hien tai." });
            }

            var booking = await BuildOwnedBookingsQuery(currentUser.Id)
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == id);

            if (booking == null)
            {
                return NotFound(new { message = "Khong tim thay booking cua ban." });
            }

            var query = _context.Invoices
                .AsNoTracking()
                .Where(invoice => invoice.BookingId == id);

            if (bookingDetailId.HasValue)
            {
                query = query.Where(invoice => invoice.BookingDetailId == bookingDetailId.Value);
            }
            else
            {
                query = query.Where(invoice => invoice.Status == "Paying" || invoice.Status == "Completed");
            }

            var invoices = await query
                .OrderByDescending(invoice => invoice.CreatedAt ?? DateTime.MinValue)
                .ThenByDescending(invoice => invoice.Id)
                .ToListAsync();

            return Ok(BuildPaymentSummary(booking, invoices));
        }

        [HttpPatch("{id:int}/confirm-payment")]
        public async Task<IActionResult> ConfirmMyBookingPayment(int id, [FromBody] UserBookingPaymentConfirmRequestDTO request)
        {
            var currentUser = await ResolveCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung hien tai." });
            }

            var booking = await BuildOwnedBookingsQuery(currentUser.Id)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (booking == null)
            {
                return NotFound(new { message = "Khong tim thay booking cua ban." });
            }

            if (booking.Status == "Cancelled")
            {
                return BadRequest(new { message = "Booking da huy, khong the xac nhan thanh toan." });
            }

            BookingDetail? detail = null;

            if (request.BookingDetailId.HasValue)
            {
                detail = booking.BookingDetails.FirstOrDefault(item => item.Id == request.BookingDetailId.Value);
                if (detail == null)
                {
                    return BadRequest(new { message = "Khong tim thay phong can xac nhan thanh toan." });
                }
            }
            else if (booking.BookingDetails.Count == 1)
            {
                detail = booking.BookingDetails.First();
            }
            else
            {
                return BadRequest(new { message = "Booking co nhieu phong, vui long chon dung phong can thanh toan." });
            }

            if (detail.Status == "Confirmed" || detail.Status == "CheckedIn" || detail.Status == "CheckedOut")
            {
                return Ok(new
                {
                    message = "Phong nay da duoc xac nhan thanh toan truoc do.",
                    bookingId = booking.Id,
                    detailId = detail.Id
                });
            }

            if (detail.Status != "Pending")
            {
                return BadRequest(new { message = "Chi co the xac nhan thanh toan cho phong dang o trang thai Pending." });
            }

            detail.Status = "Confirmed";
            booking.Status = ResolveBookingStatusFromDetails(booking.BookingDetails);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Da xac nhan thanh toan booking.",
                bookingId = booking.Id,
                detailId = detail.Id,
                bookingStatus = booking.Status,
                detailStatus = detail.Status
            });
        }

        [HttpPatch("{id:int}/complete-payment")]
        public async Task<ActionResult<UserBookingPaymentSummaryDTO>> CompleteMyBookingPayment(
            int id,
            [FromBody] UserBookingPaymentCompleteRequestDTO? request)
        {
            var currentUser = await ResolveCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung hien tai." });
            }

            var booking = await BuildOwnedBookingsQuery(currentUser.Id)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (booking == null)
            {
                return NotFound(new { message = "Khong tim thay booking cua ban." });
            }

            var targetDetailId = request?.BookingDetailId;

            var invoices = await _context.Invoices
                .Where(invoice =>
                    invoice.BookingId == id &&
                    (!targetDetailId.HasValue || invoice.BookingDetailId == targetDetailId.Value) &&
                    invoice.Status != "Completed")
                .ToListAsync();

            if (!invoices.Any())
            {
                var existingInvoices = await _context.Invoices
                    .AsNoTracking()
                    .Where(invoice =>
                        invoice.BookingId == id &&
                        (!targetDetailId.HasValue || invoice.BookingDetailId == targetDetailId.Value))
                    .ToListAsync();

                return Ok(BuildPaymentSummary(booking, existingInvoices));
            }

            var paidAt = DateTime.UtcNow;

            foreach (var invoice in invoices)
            {
                invoice.Status = "Completed";
                invoice.PaidAt = paidAt;
                invoice.UpdatedAt = paidAt;

                _context.Payments.Add(new Payment
                {
                    InvoiceId = invoice.Id,
                    AmountPaid = invoice.FinalTotal ?? 0,
                    TransactionCode = string.IsNullOrWhiteSpace(request?.TransactionCode)
                        ? $"PAY-{invoice.Id}-{paidAt:yyyyMMddHHmmss}"
                        : request.TransactionCode,
                    PaymentDate = paidAt,
                    Status = "Completed"
                });

                if (invoice.BookingDetailId.HasValue)
                {
                    var detail = booking.BookingDetails.FirstOrDefault(item => item.Id == invoice.BookingDetailId.Value);
                    if (detail != null)
                    {
                        detail.Status = "Completed";
                    }

                    var unpaidOrderServices = await _context.OrderServices
                        .Where(orderService =>
                            orderService.BookingDetailId == invoice.BookingDetailId.Value &&
                            orderService.Status != "Paid")
                        .ToListAsync();

                    foreach (var orderService in unpaidOrderServices)
                    {
                        orderService.Status = "Paid";
                    }
                }
            }

            booking.Status = ResolveBookingStatusFromDetails(booking.BookingDetails);
            await _context.SaveChangesAsync();

            var completedInvoices = await _context.Invoices
                .AsNoTracking()
                .Where(invoice =>
                    invoice.BookingId == id &&
                    (!targetDetailId.HasValue || invoice.BookingDetailId == targetDetailId.Value))
                .ToListAsync();

            return Ok(BuildPaymentSummary(booking, completedInvoices));
        }

        [HttpPost("{bookingId:int}/payments/momo")]
        public async Task<ActionResult<MomoCreatePaymentResponseDTO>> CreateMyMomoPayment(
            int bookingId,
            [FromBody] MomoCreatePaymentRequestDTO request,
            CancellationToken cancellationToken)
        {
            var currentUser = await ResolveCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung hien tai." });
            }

            if (request.Amount < 1000)
            {
                return BadRequest(new { message = "So tien thanh toan MoMo toi thieu la 1.000 VND." });
            }

            var booking = await BuildOwnedBookingsQuery(currentUser.Id)
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == bookingId, cancellationToken);

            if (booking == null)
            {
                return NotFound(new { message = "Khong tim thay booking cua ban." });
            }

            if (string.Equals(booking.Status, "Cancelled", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Booking da huy, khong the tao thanh toan MoMo." });
            }

            var detail = request.BookingDetailId.HasValue
                ? booking.BookingDetails.FirstOrDefault(item => item.Id == request.BookingDetailId.Value)
                : null;

            if (request.BookingDetailId.HasValue && detail == null)
            {
                return BadRequest(new { message = "Khong tim thay chi tiet phong can thanh toan." });
            }

            var partnerCode = _configuration["MoMo:PartnerCode"];
            var accessKey = _configuration["MoMo:AccessKey"];
            var secretKey = _configuration["MoMo:SecretKey"];
            var endpoint = _configuration["MoMo:Endpoint"] ?? "https://test-payment.momo.vn/v2/gateway/api/create";
            var storeName = _configuration["MoMo:StoreName"] ?? "Hotel";
            var lang = _configuration["MoMo:Lang"] ?? "vi";

            if (string.IsNullOrWhiteSpace(partnerCode) ||
                string.IsNullOrWhiteSpace(accessKey) ||
                string.IsNullOrWhiteSpace(secretKey))
            {
                return BadRequest(new
                {
                    message = "Chua cau hinh MoMo. Vui long dien PartnerCode, AccessKey va SecretKey trong appsettings."
                });
            }

            var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var orderId = BuildOrderId(booking.BookingCode, detail?.Id, now);
            var requestId = $"REQ-{orderId}";
            var redirectUrl = $"{Request.Scheme}://localhost:5173/user/booking-history/{bookingId}/payment{BuildDetailQuery(detail?.Id)}";
            var ipnUrl = $"{Request.Scheme}://{Request.Host}/api/momo/ipn";
            var orderInfo = BuildOrderInfo(request.OrderInfo, booking.BookingCode, detail);
            var extraData = BuildExtraData(bookingId, detail?.Id);
            var amount = request.Amount.ToString(CultureInfo.InvariantCulture);
            const string requestType = "captureWallet";

            var rawSignature =
                $"accessKey={accessKey}&amount={amount}&extraData={extraData}" +
                $"&ipnUrl={ipnUrl}&orderId={orderId}&orderInfo={orderInfo}" +
                $"&partnerCode={partnerCode}&redirectUrl={redirectUrl}" +
                $"&requestId={requestId}&requestType={requestType}";

            var signature = Sign(rawSignature, secretKey);

            var payload = new MomoCreateRequestPayload
            {
                PartnerCode = partnerCode,
                AccessKey = accessKey,
                RequestType = requestType,
                IpnUrl = ipnUrl,
                RedirectUrl = redirectUrl,
                OrderId = orderId,
                Amount = request.Amount,
                OrderInfo = orderInfo,
                RequestId = requestId,
                ExtraData = extraData,
                Signature = signature,
                Lang = lang,
                AutoCapture = true,
                StoreName = storeName,
                StoreId = $"USER-BOOKING-{bookingId}"
            };

            var client = _httpClientFactory.CreateClient();
            using var content = new StringContent(JsonSerializer.Serialize(payload, JsonOptions), Encoding.UTF8, "application/json");

            HttpResponseMessage response;
            string rawResponse;

            try
            {
                response = await client.PostAsync(endpoint, content, cancellationToken);
                rawResponse = await response.Content.ReadAsStringAsync(cancellationToken);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "MoMo create payment request failed for user booking {BookingId}.", bookingId);
                return StatusCode(502, new { message = "Khong the ket noi den cong thanh toan MoMo." });
            }

            var momoResponse = JsonSerializer.Deserialize<MomoCreatePaymentResponseDTO>(rawResponse, JsonOptions);

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, new
                {
                    message = momoResponse?.Message ?? "Khong the tao thanh toan MoMo.",
                    resultCode = momoResponse?.ResultCode
                });
            }

            if (momoResponse == null)
            {
                return StatusCode(502, new { message = "Phan hoi MoMo khong hop le." });
            }

            return Ok(momoResponse);
        }

        [HttpPost("{bookingId:int}/checkout-payments/momo")]
        public async Task<ActionResult<MomoCreatePaymentResponseDTO>> CreateMyCheckoutMomoPayment(
            int bookingId,
            [FromBody] UserBookingCheckoutMomoPaymentRequestDTO? request,
            CancellationToken cancellationToken)
        {
            var currentUser = await ResolveCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung hien tai." });
            }

            var booking = await BuildOwnedBookingsQuery(currentUser.Id)
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == bookingId, cancellationToken);

            if (booking == null)
            {
                return NotFound(new { message = "Khong tim thay booking cua ban." });
            }

            var invoiceQuery = _context.Invoices
                .AsNoTracking()
                .Where(invoice =>
                    invoice.BookingId == bookingId &&
                    invoice.Status != "Completed");

            if (request?.BookingDetailId.HasValue == true)
            {
                invoiceQuery = invoiceQuery.Where(invoice => invoice.BookingDetailId == request.BookingDetailId.Value);
            }

            var invoices = await invoiceQuery.ToListAsync(cancellationToken);
            var totalAmount = Convert.ToInt64(Math.Round(invoices.Sum(item => item.FinalTotal ?? 0), MidpointRounding.AwayFromZero));

            if (totalAmount < 1000)
            {
                return BadRequest(new { message = "So tien thanh toan MoMo toi thieu la 1.000 VND." });
            }

            var partnerCode = _configuration["MoMo:PartnerCode"];
            var accessKey = _configuration["MoMo:AccessKey"];
            var secretKey = _configuration["MoMo:SecretKey"];
            var endpoint = _configuration["MoMo:Endpoint"] ?? "https://test-payment.momo.vn/v2/gateway/api/create";
            var storeName = _configuration["MoMo:StoreName"] ?? "Hotel";
            var lang = _configuration["MoMo:Lang"] ?? "vi";

            if (string.IsNullOrWhiteSpace(partnerCode) ||
                string.IsNullOrWhiteSpace(accessKey) ||
                string.IsNullOrWhiteSpace(secretKey))
            {
                return BadRequest(new
                {
                    message = "Chua cau hinh MoMo. Vui long dien PartnerCode, AccessKey va SecretKey trong appsettings."
                });
            }

            var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var orderId = BuildOrderId($"{booking.BookingCode}-CHECKOUT", request?.BookingDetailId, now);
            var requestId = $"REQ-{orderId}";
            var redirectUrl = $"{Request.Scheme}://localhost:5173/user/booking-history/{bookingId}/payment{BuildDetailQuery(request?.BookingDetailId)}";
            var ipnUrl = $"{Request.Scheme}://{Request.Host}/api/momo/ipn";
            var orderInfo = $"Thanh toan checkout booking {booking.BookingCode}";
            var extraData = BuildExtraData(bookingId, request?.BookingDetailId);
            const string requestType = "captureWallet";

            var rawSignature =
                $"accessKey={accessKey}&amount={totalAmount.ToString(CultureInfo.InvariantCulture)}&extraData={extraData}" +
                $"&ipnUrl={ipnUrl}&orderId={orderId}&orderInfo={orderInfo}" +
                $"&partnerCode={partnerCode}&redirectUrl={redirectUrl}" +
                $"&requestId={requestId}&requestType={requestType}";

            var signature = Sign(rawSignature, secretKey);

            var payload = new MomoCreateRequestPayload
            {
                PartnerCode = partnerCode,
                AccessKey = accessKey,
                RequestType = requestType,
                IpnUrl = ipnUrl,
                RedirectUrl = redirectUrl,
                OrderId = orderId,
                Amount = totalAmount,
                OrderInfo = orderInfo,
                RequestId = requestId,
                ExtraData = extraData,
                Signature = signature,
                Lang = lang,
                AutoCapture = true,
                StoreName = storeName,
                StoreId = $"USER-CHECKOUT-{bookingId}"
            };

            var client = _httpClientFactory.CreateClient();
            using var content = new StringContent(JsonSerializer.Serialize(payload, JsonOptions), Encoding.UTF8, "application/json");

            HttpResponseMessage response;
            string rawResponse;

            try
            {
                response = await client.PostAsync(endpoint, content, cancellationToken);
                rawResponse = await response.Content.ReadAsStringAsync(cancellationToken);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "MoMo checkout payment request failed for user booking {BookingId}.", bookingId);
                return StatusCode(502, new { message = "Khong the ket noi den cong thanh toan MoMo." });
            }

            var momoResponse = JsonSerializer.Deserialize<MomoCreatePaymentResponseDTO>(rawResponse, JsonOptions);

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, new
                {
                    message = momoResponse?.Message ?? "Khong the tao thanh toan MoMo.",
                    resultCode = momoResponse?.ResultCode
                });
            }

            if (momoResponse == null)
            {
                return StatusCode(502, new { message = "Phan hoi MoMo khong hop le." });
            }

            return Ok(momoResponse);
        }

        private static string BuildOrderId(string bookingCode, int? detailId, long timestamp)
        {
            var normalizedBookingCode = new string((bookingCode ?? "BOOKING")
                .Where(ch => char.IsLetterOrDigit(ch) || ch is '-' or '_' or '.')
                .ToArray());

            var detailSuffix = detailId.HasValue ? $"-D{detailId.Value}" : string.Empty;
            return $"MOMO-{normalizedBookingCode}{detailSuffix}-{timestamp}";
        }

        private static string BuildOrderInfo(string? customOrderInfo, string bookingCode, BookingDetail? detail)
        {
            if (!string.IsNullOrWhiteSpace(customOrderInfo))
            {
                return customOrderInfo.Trim()[..Math.Min(255, customOrderInfo.Trim().Length)];
            }

            var roomNumber = detail?.Room?.RoomNumber;
            var value = detail == null
                ? $"Thanh toan booking {bookingCode}"
                : $"Thanh toan booking {bookingCode} - phong {roomNumber ?? detail.Id.ToString(CultureInfo.InvariantCulture)}";

            return value[..Math.Min(255, value.Length)];
        }

        private static string BuildExtraData(int bookingId, int? detailId)
        {
            var payload = new Dictionary<string, string?>
            {
                ["bookingId"] = bookingId.ToString(CultureInfo.InvariantCulture),
                ["detailId"] = detailId?.ToString(CultureInfo.InvariantCulture),
                ["source"] = "user-booking-payment"
            };

            return Convert.ToBase64String(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(payload, JsonOptions)));
        }

        private static string BuildDetailQuery(int? detailId)
        {
            return detailId.HasValue ? $"?detailId={detailId.Value}" : string.Empty;
        }

        private static string Sign(string rawData, string secretKey)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            return Convert.ToHexString(hash).ToLowerInvariant();
        }

        private sealed class MomoCreateRequestPayload
        {
            [JsonPropertyName("partnerCode")]
            public string PartnerCode { get; set; } = string.Empty;

            [JsonPropertyName("accessKey")]
            public string AccessKey { get; set; } = string.Empty;

            [JsonPropertyName("requestType")]
            public string RequestType { get; set; } = string.Empty;

            [JsonPropertyName("ipnUrl")]
            public string IpnUrl { get; set; } = string.Empty;

            [JsonPropertyName("redirectUrl")]
            public string RedirectUrl { get; set; } = string.Empty;

            [JsonPropertyName("orderId")]
            public string OrderId { get; set; } = string.Empty;

            [JsonPropertyName("amount")]
            public long Amount { get; set; }

            [JsonPropertyName("orderInfo")]
            public string OrderInfo { get; set; } = string.Empty;

            [JsonPropertyName("requestId")]
            public string RequestId { get; set; } = string.Empty;

            [JsonPropertyName("extraData")]
            public string ExtraData { get; set; } = string.Empty;

            [JsonPropertyName("signature")]
            public string Signature { get; set; } = string.Empty;

            [JsonPropertyName("lang")]
            public string Lang { get; set; } = "vi";

            [JsonPropertyName("autoCapture")]
            public bool AutoCapture { get; set; } = true;

            [JsonPropertyName("storeName")]
            public string StoreName { get; set; } = string.Empty;

            [JsonPropertyName("storeId")]
            public string StoreId { get; set; } = string.Empty;
        }
    }

    public class UserBookingPaymentConfirmRequestDTO
    {
        public int? BookingDetailId { get; set; }
    }

    public class UserBookingPaymentCompleteRequestDTO
    {
        public int? BookingDetailId { get; set; }
        public string? TransactionCode { get; set; }
    }

    public class UserBookingCheckoutMomoPaymentRequestDTO
    {
        public int? BookingDetailId { get; set; }
    }
}
