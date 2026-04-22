using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using backend.Data;
using backend.DTOs.Payment;
using backend.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/bookings/{bookingId:int}/payments")]
    [Tags("Booking Payments")]
    public class BookingPaymentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<BookingPaymentsController> _logger;

        private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

        public BookingPaymentsController(
            AppDbContext context,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            ILogger<BookingPaymentsController> logger)
        {
            _context = context;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        [HttpPost("momo")]
        [Permission("PAY_INVOICE")]
        public async Task<ActionResult<MomoCreatePaymentResponseDTO>> CreateMomoPayment(
            int bookingId,
            [FromBody] MomoCreatePaymentRequestDTO request,
            CancellationToken cancellationToken)
        {
            if (request.Amount < 1000)
            {
                return BadRequest(new { message = "So tien thanh toan MoMo toi thieu la 1.000 VND." });
            }

            var booking = await _context.Bookings
                .Include(item => item.Guest)
                .Include(item => item.BookingDetails)
                    .ThenInclude(detail => detail.Room)
                .Include(item => item.BookingDetails)
                    .ThenInclude(detail => detail.RoomType)
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == bookingId, cancellationToken);

            if (booking == null)
            {
                return NotFound(new { message = "Khong tim thay booking." });
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
            var redirectTemplate = _configuration["MoMo:RedirectUrl"];
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
            var orderId = BuildOrderId(booking.BookingCode, detail?.Id, now);
            var requestId = $"REQ-{orderId}";
            var redirectUrl = ResolveUrlTemplate(
                redirectTemplate,
                $"{Request.Scheme}://localhost:5173/admin/bookings/{bookingId}/payment-qr{BuildDetailQuery(detail?.Id)}",
                bookingId,
                detail?.Id);
            var ipnUrl = ResolveUrlTemplate(
                ipnTemplate,
                $"{Request.Scheme}://{Request.Host}/api/momo/ipn",
                bookingId,
                detail?.Id);
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
                StoreId = $"BOOKING-{bookingId}"
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
                _logger.LogError(ex, "MoMo create payment request failed.");
                return StatusCode(502, new { message = "Khong the ket noi den cong thanh toan MoMo." });
            }

            var momoResponse = JsonSerializer.Deserialize<MomoCreatePaymentResponseDTO>(rawResponse, JsonOptions);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("MoMo create payment failed with status {StatusCode}. Body: {Body}", response.StatusCode, rawResponse);

                return StatusCode((int)response.StatusCode, new
                {
                    message = momoResponse?.Message ?? "Khong the tao thanh toan MoMo.",
                    resultCode = momoResponse?.ResultCode
                });
            }

            if (momoResponse == null)
            {
                _logger.LogWarning("MoMo create payment returned an unreadable payload: {Body}", rawResponse);
                return StatusCode(502, new { message = "Phan hoi MoMo khong hop le." });
            }

            return Ok(momoResponse);
        }

        [HttpPost("/api/momo/ipn")]
        public async Task<IActionResult> HandleMomoIpn([FromBody] MomoIpnResponseDTO? payload, CancellationToken cancellationToken)
        {
            if (payload == null)
            {
                return BadRequest(new { message = "Payload IPN khong hop le." });
            }

            var accessKey = _configuration["MoMo:AccessKey"];
            var secretKey = _configuration["MoMo:SecretKey"];

            if (string.IsNullOrWhiteSpace(accessKey) || string.IsNullOrWhiteSpace(secretKey))
            {
                _logger.LogWarning("Received MoMo IPN but MoMo credentials are not configured.");
                return StatusCode(500, new { message = "Chua cau hinh chu ky MoMo." });
            }

            var rawSignature =
                $"accessKey={accessKey}&amount={payload.Amount.ToString(CultureInfo.InvariantCulture)}" +
                $"&extraData={payload.ExtraData ?? string.Empty}&message={payload.Message}" +
                $"&orderId={payload.OrderId}&orderInfo={payload.OrderInfo ?? string.Empty}" +
                $"&orderType={payload.OrderType ?? string.Empty}&partnerCode={payload.PartnerCode}" +
                $"&payType={payload.PayType ?? string.Empty}&requestId={payload.RequestId}" +
                $"&responseTime={payload.ResponseTime}&resultCode={payload.ResultCode}" +
                $"&transId={(payload.TransId ?? 0).ToString(CultureInfo.InvariantCulture)}";

            var expectedSignature = Sign(rawSignature, secretKey);
            if (!string.Equals(expectedSignature, payload.Signature, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning(
                    "Rejected MoMo IPN for order {OrderId} because signature validation failed.",
                    payload.OrderId);
                return BadRequest(new { message = "Chu ky IPN khong hop le." });
            }

            var decodedExtraData = DecodeExtraData(payload.ExtraData);
            if (decodedExtraData != null &&
                decodedExtraData.TryGetValue("bookingId", out var bookingIdValue) &&
                int.TryParse(bookingIdValue, out var bookingId))
            {
                var bookingExists = await _context.Bookings
                    .AsNoTracking()
                    .AnyAsync(item => item.Id == bookingId, cancellationToken);

                if (!bookingExists)
                {
                    _logger.LogWarning(
                        "Received MoMo IPN for order {OrderId} but booking {BookingId} was not found.",
                        payload.OrderId,
                        bookingId);
                    return BadRequest(new { message = "Booking trong extraData khong ton tai." });
                }
            }

            _logger.LogInformation(
                "Received valid MoMo IPN for order {OrderId} with result code {ResultCode}.",
                payload.OrderId,
                payload.ResultCode);

            return NoContent();
        }

        private static string BuildOrderId(string bookingCode, int? detailId, long timestamp)
        {
            var normalizedBookingCode = new string((bookingCode ?? "BOOKING")
                .Where(ch => char.IsLetterOrDigit(ch) || ch is '-' or '_' or '.')
                .ToArray());

            var detailSuffix = detailId.HasValue ? $"-D{detailId.Value}" : string.Empty;
            return $"MOMO-{normalizedBookingCode}{detailSuffix}-{timestamp}";
        }

        private static string BuildOrderInfo(string? customOrderInfo, string bookingCode, Models.BookingDetail? detail)
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
                ["source"] = "admin-booking-payment"
            };

            return Convert.ToBase64String(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(payload, JsonOptions)));
        }

        private static string ResolveUrlTemplate(string? template, string fallback, int bookingId, int? detailId)
        {
            var value = string.IsNullOrWhiteSpace(template) ? fallback : template.Trim();
            return value
                .Replace("{bookingId}", bookingId.ToString(CultureInfo.InvariantCulture), StringComparison.OrdinalIgnoreCase)
                .Replace("{detailId}", detailId?.ToString(CultureInfo.InvariantCulture) ?? string.Empty, StringComparison.OrdinalIgnoreCase);
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

        private static Dictionary<string, string?>? DecodeExtraData(string? extraData)
        {
            if (string.IsNullOrWhiteSpace(extraData))
            {
                return null;
            }

            try
            {
                var json = Encoding.UTF8.GetString(Convert.FromBase64String(extraData));
                return JsonSerializer.Deserialize<Dictionary<string, string?>>(json, JsonOptions);
            }
            catch (FormatException)
            {
                return null;
            }
            catch (JsonException)
            {
                return null;
            }
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
