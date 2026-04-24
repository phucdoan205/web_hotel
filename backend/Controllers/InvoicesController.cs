using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using backend.Data;
using backend.DTOs.Invoice;
using backend.DTOs.Payment;
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
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<InvoicesController> _logger;

        private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

        public InvoicesController(
            AppDbContext context,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            ILogger<InvoicesController> logger)
        {
            _context = context;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
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

            return "Pending";
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

            if (!string.Equals(bookingDetail.Status, "CheckedOut", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Chỉ có thể tạo hóa đơn cho phòng đã check-out.");
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
            var totalServiceAmount = await _context.OrderServiceDetails
                .AsNoTracking()
                .Where(detail =>
                    detail.OrderService != null &&
                    detail.OrderService.BookingDetailId == bookingDetail.Id &&
                    detail.OrderService.Status != "Paid")
                .SumAsync(detail => (decimal?)(detail.Quantity * detail.UnitPrice)) ?? 0;
            var totalRoomAmount = dto.TotalRoomAmount ?? 0;
            var discountAmount = dto.DiscountAmount ?? 0;
            var finalTotal = Math.Max(0, totalRoomAmount + totalServiceAmount - discountAmount);

            var invoice = new Invoice
            {
                BookingId = booking.Id,
                BookingDetailId = bookingDetail.Id,
                VoucherId = dto.VoucherId,
                Code = GenerateInvoiceCode(roomNumber, now),
                BookingCode = booking.BookingCode,
                GuestName = booking.Guest?.Name,
                RoomNumber = roomNumber,
                RoomName = roomName,
                RoomRate = dto.RoomRate ?? bookingDetail.PricePerNight,
                CheckInDate = bookingDetail.CheckInDate,
                CheckOutDate = dto.CheckOutDate ?? now,
                StayedDays = dto.StayedDays ?? 1,
                TotalRoomAmount = totalRoomAmount,
                TotalServiceAmount = totalServiceAmount,
                DiscountAmount = discountAmount,
                TaxAmount = 0,
                FinalTotal = finalTotal,
                Status = "Pending",
                Notes = dto.Notes,
                VoucherCode = dto.VoucherCode,
                VoucherDiscountType = dto.VoucherDiscountType,
                VoucherDiscountValue = dto.VoucherDiscountValue,
                CreatedAt = now,
                UpdatedAt = now
            };

            _context.Invoices.Add(invoice);

            var trackedBookingDetail = await _context.BookingDetails.FirstOrDefaultAsync(item => item.Id == bookingDetail.Id);
            if (trackedBookingDetail != null)
            {
                trackedBookingDetail.Status = "Pending";
            }

            var trackedBooking = await _context.Bookings
                .Include(item => item.BookingDetails)
                .FirstOrDefaultAsync(item => item.Id == booking.Id);

            if (trackedBooking != null)
            {
                trackedBooking.Status = ResolveBookingStatusFromDetails(trackedBooking.BookingDetails);
            }

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

            if (invoice.BookingDetailId.HasValue)
            {
                var bookingDetail = await _context.BookingDetails
                    .Include(item => item.Booking)
                    .ThenInclude(item => item!.BookingDetails)
                    .FirstOrDefaultAsync(item => item.Id == invoice.BookingDetailId.Value);

                if (bookingDetail != null)
                {
                    bookingDetail.Status = "Completed";

                    if (bookingDetail.Booking != null)
                    {
                        bookingDetail.Booking.Status = ResolveBookingStatusFromDetails(bookingDetail.Booking.BookingDetails);
                    }
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

            await _context.SaveChangesAsync();

            return Ok(MapInvoice(invoice));
        }

        [HttpPost("{id:int}/momo")]
        [Permission("PAY_INVOICE")]
        public async Task<ActionResult<MomoCreatePaymentResponseDTO>> CreateInvoiceMomoPayment(
            int id,
            CancellationToken cancellationToken)
        {
            var invoice = await _context.Invoices
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

            if (invoice == null)
            {
                return NotFound(new { message = "Khong tim thay hoa don." });
            }

            if (string.Equals(invoice.Status, "Completed", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Hoa don nay da duoc thanh toan." });
            }

            var totalAmount = Convert.ToInt64(Math.Round(invoice.FinalTotal ?? 0, MidpointRounding.AwayFromZero));
            if (totalAmount < 1000)
            {
                return BadRequest(new { message = "So tien thanh toan MoMo toi thieu la 1.000 VND." });
            }

            var partnerCode = _configuration["MoMo:PartnerCode"];
            var accessKey = _configuration["MoMo:AccessKey"];
            var secretKey = _configuration["MoMo:SecretKey"];
            var endpoint = _configuration["MoMo:Endpoint"] ?? "https://test-payment.momo.vn/v2/gateway/api/create";
            var redirectTemplate = _configuration["MoMo:InvoiceRedirectUrl"];
            var ipnTemplate = _configuration["MoMo:IpnUrl"];
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
            var orderId = BuildInvoiceOrderId(invoice.Code, id, now);
            var requestId = $"REQ-{orderId}";
            var redirectUrl = ResolveInvoiceUrlTemplate(
                redirectTemplate,
                $"{Request.Scheme}://localhost:5173/admin/invoices/{id}/payment",
                id);
            var ipnUrl = ResolveInvoiceUrlTemplate(
                ipnTemplate,
                $"{Request.Scheme}://{Request.Host}/api/momo/ipn",
                id);
            var orderInfo = BuildInvoiceOrderInfo(invoice);
            var extraData = BuildInvoiceExtraData(id, invoice.BookingId, invoice.BookingDetailId);
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
                StoreId = $"INVOICE-{id}"
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
                _logger.LogError(ex, "MoMo create invoice payment request failed for invoice {InvoiceId}.", id);
                return StatusCode(502, new { message = "Khong the ket noi den cong thanh toan MoMo." });
            }

            var momoResponse = JsonSerializer.Deserialize<MomoCreatePaymentResponseDTO>(rawResponse, JsonOptions);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "MoMo create invoice payment failed for invoice {InvoiceId} with status {StatusCode}. Body: {Body}",
                    id,
                    response.StatusCode,
                    rawResponse);

                return StatusCode((int)response.StatusCode, new
                {
                    message = momoResponse?.Message ?? "Khong the tao thanh toan MoMo cho hoa don.",
                    resultCode = momoResponse?.ResultCode
                });
            }

            if (momoResponse == null)
            {
                _logger.LogWarning("MoMo create invoice payment returned an unreadable payload: {Body}", rawResponse);
                return StatusCode(502, new { message = "Phan hoi MoMo khong hop le." });
            }

            return Ok(momoResponse);
        }

        private static string BuildInvoiceOrderId(string? invoiceCode, int invoiceId, long timestamp)
        {
            var normalizedCode = new string((invoiceCode ?? $"INV-{invoiceId}")
                .Where(ch => char.IsLetterOrDigit(ch) || ch is '-' or '_' or '.')
                .ToArray());

            return $"MOMO-{normalizedCode}-{timestamp}";
        }

        private static string BuildInvoiceOrderInfo(Invoice invoice)
        {
            var value = $"Thanh toan hoa don {invoice.Code ?? invoice.Id.ToString(CultureInfo.InvariantCulture)}";
            return value[..Math.Min(255, value.Length)];
        }

        private static string BuildInvoiceExtraData(int invoiceId, int? bookingId, int? bookingDetailId)
        {
            var payload = new Dictionary<string, string?>
            {
                ["invoiceId"] = invoiceId.ToString(CultureInfo.InvariantCulture),
                ["bookingId"] = bookingId?.ToString(CultureInfo.InvariantCulture),
                ["detailId"] = bookingDetailId?.ToString(CultureInfo.InvariantCulture),
                ["source"] = "admin-invoice-payment"
            };

            return Convert.ToBase64String(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(payload, JsonOptions)));
        }

        private static string ResolveInvoiceUrlTemplate(string? template, string fallback, int invoiceId)
        {
            var value = string.IsNullOrWhiteSpace(template) ? fallback : template.Trim();
            return value.Replace("{invoiceId}", invoiceId.ToString(CultureInfo.InvariantCulture), StringComparison.OrdinalIgnoreCase);
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
}
