using backend.Data;
using backend.DTOs.Invoice;
using backend.Models;
using backend.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Tags("Invoices")]
    public class InvoicesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InvoicesController(AppDbContext context)
        {
            _context = context;
        }

        private static string GenerateInvoiceCode(string? bookingCode, string? roomNumber, int detailId)
        {
            var normalizedBookingCode = string.IsNullOrWhiteSpace(bookingCode)
                ? "BK"
                : bookingCode.Trim().Replace(" ", string.Empty).ToUpperInvariant();
            var normalizedRoomNumber = string.IsNullOrWhiteSpace(roomNumber)
                ? "ROOM"
                : roomNumber.Trim().Replace(" ", string.Empty).ToUpperInvariant();

            return $"INV-{normalizedBookingCode}-{normalizedRoomNumber}-{detailId:D4}";
        }

        private static InvoiceResponseDTO MapInvoice(Invoice invoice) => new()
        {
            Id = invoice.Id,
            BookingId = invoice.BookingId,
            BookingDetailId = invoice.BookingDetailId,
            VoucherId = invoice.VoucherId,
            Code = invoice.Code,
            BookingCode = invoice.BookingCode,
            GuestName = invoice.GuestName,
            RoomNumber = invoice.RoomNumber,
            RoomName = invoice.RoomName,
            RoomRate = invoice.RoomRate,
            CheckInDate = invoice.CheckInDate,
            CheckOutDate = invoice.CheckOutDate,
            StayedDays = invoice.StayedDays,
            TotalRoomAmount = invoice.TotalRoomAmount,
            TotalServiceAmount = invoice.TotalServiceAmount,
            DiscountAmount = invoice.DiscountAmount,
            TaxAmount = invoice.TaxAmount,
            FinalTotal = invoice.FinalTotal,
            Status = invoice.Status,
            Notes = invoice.Notes,
            VoucherCode = invoice.VoucherCode,
            VoucherDiscountType = invoice.VoucherDiscountType,
            VoucherDiscountValue = invoice.VoucherDiscountValue,
            CreatedAt = invoice.CreatedAt,
            UpdatedAt = invoice.UpdatedAt,
            PaidAt = invoice.PaidAt
        };

        [HttpGet]
        [Permission("VIEW_INVOICES")]
        public async Task<ActionResult<IEnumerable<InvoiceResponseDTO>>> GetInvoices(
            [FromQuery] string? search = null,
            [FromQuery] int? bookingId = null,
            [FromQuery] int? bookingDetailId = null,
            [FromQuery] string? status = null)
        {
            var query = _context.Invoices.AsNoTracking().AsQueryable();

            if (bookingId.HasValue)
            {
                query = query.Where(invoice => invoice.BookingId == bookingId.Value);
            }

            if (bookingDetailId.HasValue)
            {
                query = query.Where(invoice => invoice.BookingDetailId == bookingDetailId.Value);
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(invoice => invoice.Status == status);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var normalizedSearch = search.Trim().ToLower();
                query = query.Where(invoice =>
                    (invoice.Code ?? string.Empty).ToLower().Contains(normalizedSearch) ||
                    (invoice.BookingCode ?? string.Empty).ToLower().Contains(normalizedSearch) ||
                    (invoice.GuestName ?? string.Empty).ToLower().Contains(normalizedSearch) ||
                    (invoice.RoomNumber ?? string.Empty).ToLower().Contains(normalizedSearch));
            }

            var invoices = await query
                .OrderByDescending(invoice => invoice.CreatedAt ?? DateTime.MinValue)
                .ThenByDescending(invoice => invoice.Id)
                .ToListAsync();

            return Ok(invoices.Select(MapInvoice));
        }

        [HttpGet("{id:int}")]
        [Permission("VIEW_INVOICES")]
        public async Task<ActionResult<InvoiceResponseDTO>> GetInvoiceById(int id)
        {
            var invoice = await _context.Invoices.AsNoTracking().FirstOrDefaultAsync(item => item.Id == id);
            if (invoice == null)
            {
                return NotFound("Không tìm thấy hóa đơn.");
            }

            return Ok(MapInvoice(invoice));
        }

        [HttpPost]
        [Permission("CREATE_INVOICES")]
        public async Task<ActionResult<InvoiceResponseDTO>> CreateInvoice([FromBody] InvoiceCreateDTO dto)
        {
            if (!dto.BookingId.HasValue || !dto.BookingDetailId.HasValue)
            {
                return BadRequest("Thiếu thông tin booking hoặc chi tiết phòng.");
            }

            var booking = await _context.Bookings
                .Include(item => item.Guest)
                .Include(item => item.BookingDetails)
                    .ThenInclude(detail => detail.Room)
                .Include(item => item.BookingDetails)
                    .ThenInclude(detail => detail.RoomType)
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == dto.BookingId.Value);

            if (booking == null)
            {
                return NotFound("Không tìm thấy booking.");
            }

            var bookingDetail = booking.BookingDetails.FirstOrDefault(detail => detail.Id == dto.BookingDetailId.Value);
            if (bookingDetail == null)
            {
                return NotFound("Không tìm thấy chi tiết phòng của booking.");
            }

            var duplicatedInvoice = await _context.Invoices
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.BookingDetailId == dto.BookingDetailId.Value);

            if (duplicatedInvoice != null)
            {
                return Conflict("Phòng này đã có hóa đơn.");
            }

            var roomNumber = bookingDetail.Room?.RoomNumber ?? "--";
            var roomName = bookingDetail.RoomType?.Name ?? "Phòng";
            var now = DateTime.UtcNow;

            var invoice = new Invoice
            {
                BookingId = booking.Id,
                BookingDetailId = bookingDetail.Id,
                VoucherId = dto.VoucherId,
                Code = GenerateInvoiceCode(booking.BookingCode, roomNumber, bookingDetail.Id),
                BookingCode = booking.BookingCode,
                GuestName = booking.Guest?.Name,
                RoomNumber = roomNumber,
                RoomName = roomName,
                RoomRate = dto.RoomRate ?? bookingDetail.PricePerNight,
                CheckInDate = bookingDetail.CheckInDate,
                CheckOutDate = dto.CheckOutDate ?? now,
                StayedDays = dto.StayedDays ?? 1,
                TotalRoomAmount = dto.TotalRoomAmount ?? 0,
                TotalServiceAmount = 0,
                DiscountAmount = dto.DiscountAmount ?? 0,
                TaxAmount = 0,
                FinalTotal = dto.FinalTotal ?? 0,
                Status = "Pending",
                Notes = dto.Notes,
                VoucherCode = dto.VoucherCode,
                VoucherDiscountType = dto.VoucherDiscountType,
                VoucherDiscountValue = dto.VoucherDiscountValue,
                CreatedAt = now,
                UpdatedAt = now
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInvoiceById), new { id = invoice.Id }, MapInvoice(invoice));
        }

        [HttpPatch("{id:int}/complete")]
        [Permission("PAY_INVOICE")]
        public async Task<ActionResult<InvoiceResponseDTO>> CompleteInvoice(int id, [FromBody] InvoicePaymentDTO? dto)
        {
            var invoice = await _context.Invoices.FirstOrDefaultAsync(item => item.Id == id);
            if (invoice == null)
            {
                return NotFound("Không tìm thấy hóa đơn.");
            }

            if (string.Equals(invoice.Status, "Completed", StringComparison.OrdinalIgnoreCase))
            {
                return Ok(MapInvoice(invoice));
            }

            var paidAt = DateTime.UtcNow;
            invoice.Status = "Completed";
            invoice.PaidAt = paidAt;
            invoice.UpdatedAt = paidAt;

            _context.Payments.Add(new Payment
            {
                InvoiceId = invoice.Id,
                PaymentMethodId = dto?.PaymentMethodId,
                AmountPaid = invoice.FinalTotal ?? 0,
                TransactionCode = string.IsNullOrWhiteSpace(dto?.TransactionCode)
                    ? $"PAY-{invoice.Id}-{paidAt:yyyyMMddHHmmss}"
                    : dto!.TransactionCode,
                PaymentDate = paidAt,
                Status = "Completed"
            });

            await _context.SaveChangesAsync();

            return Ok(MapInvoice(invoice));
        }
    }
}
