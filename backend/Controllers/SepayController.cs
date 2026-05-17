using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/payment/sepay")]
    public class SepayController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<SepayController> _logger;
        private readonly IMembershipService _membershipService;
        private readonly IConfiguration _configuration;

        public SepayController(
            AppDbContext context,
            ILogger<SepayController> logger,
            IMembershipService membershipService,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _membershipService = membershipService;
            _configuration = configuration;
        }

        [HttpPost]
        public async Task<IActionResult> HandleWebhook()
        {
            try
            {
                using var reader = new StreamReader(Request.Body);
                var body = await reader.ReadToEndAsync();

                // Verify Webhook Signature
                var secretKey = _configuration["Sepay:WebhookSecret"];
                if (!string.IsNullOrEmpty(secretKey))
                {
                    // Allow either API Key in Authorization header or HMAC-SHA256 signature
                    var authHeader = Request.Headers["Authorization"].ToString();
                    var isAuthMatched = authHeader.Equals($"Apikey {secretKey}", StringComparison.OrdinalIgnoreCase) || 
                                        authHeader.Equals($"Bearer {secretKey}", StringComparison.OrdinalIgnoreCase);

                    // Check X-SePay-Signature if auth header doesn't match
                    if (!isAuthMatched)
                    {
                        var signatureHeader = Request.Headers["X-SePay-Signature"].ToString();
                        var timestamp = Request.Headers["X-SePay-Timestamp"].ToString();

                        if (!string.IsNullOrEmpty(signatureHeader) && !string.IsNullOrEmpty(timestamp))
                        {
                            var message = $"{timestamp}.{body}";
                            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
                            var messageBytes = Encoding.UTF8.GetBytes(message);

                            using var hmac = new HMACSHA256(keyBytes);
                            var hashBytes = hmac.ComputeHash(messageBytes);
                            var computedHash = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

                            var expectedSignature = $"sha256={computedHash}";
                            if (!signatureHeader.Equals(expectedSignature, StringComparison.OrdinalIgnoreCase))
                            {
                                _logger.LogWarning("Sepay Webhook: Invalid HMAC signature.");
                                return Unauthorized(new { success = false, message = "Invalid signature" });
                            }
                        }
                        else
                        {
                            _logger.LogWarning("Sepay Webhook: Missing auth/signature headers.");
                            return Unauthorized(new { success = false, message = "Missing signature" });
                        }
                    }
                }

                var payload = JsonSerializer.Deserialize<SepayWebhookDTO>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (payload == null || payload.transferType != "in")
                {
                    return Ok(new { success = true, message = "Ignored or invalid payload" });
                }

                _logger.LogInformation("Received Sepay Webhook: Amount={Amount}, Content={Content}", payload.transferAmount, payload.content);

                // First try to find by InvoiceCode exactly
                var invoices = await _context.Invoices
                    .Include(i => i.Booking)
                        .ThenInclude(b => b.BookingDetails)
                    .Where(i => i.Status != "Completed" && i.Status != "Cancelled")
                    .ToListAsync();
                    
                Invoice? matchedInvoice = null;
                Booking? matchedBooking = null;

                foreach(var inv in invoices)
                {
                    if (payload.content.Contains("DH" + inv.Code, StringComparison.OrdinalIgnoreCase) || 
                        payload.content.Contains(inv.Code, StringComparison.OrdinalIgnoreCase))
                    {
                        matchedInvoice = inv;
                        matchedBooking = inv.Booking;
                        break;
                    }
                }

                // If not found by invoice code, try to find by booking code
                if (matchedInvoice == null)
                {
                    var bookings = await _context.Bookings
                        .Include(b => b.BookingDetails)
                        .Where(b => b.Status != "Cancelled")
                        .ToListAsync();

                    foreach (var b in bookings)
                    {
                        // Check for exact matching with DH prefix or just the booking code
                        if (payload.content.Contains("DH" + b.BookingCode, StringComparison.OrdinalIgnoreCase) || 
                            payload.content.Contains(b.BookingCode, StringComparison.OrdinalIgnoreCase))
                        {
                            matchedBooking = b;
                            break;
                        }
                    }

                    if (matchedBooking != null)
                    {
                        matchedInvoice = invoices.FirstOrDefault(i => i.BookingId == matchedBooking.Id);
                        if (matchedInvoice == null)
                        {
                            matchedInvoice = await _context.Invoices
                                .FirstOrDefaultAsync(i => i.BookingId == matchedBooking.Id && i.Status != "Completed");
                        }
                    }
                }

                if (matchedBooking == null)
                {
                    _logger.LogWarning("Sepay Webhook: Could not find booking or invoice matching content: {Content}", payload.content);
                    return Ok(new { success = true, message = "No matching booking or invoice found" }); // Return 200 so SePay doesn't retry
                }

                // Create payment record and complete invoices/booking
                var invoice = matchedInvoice;

                if (invoice != null && invoice.Status != "Completed")
                {
                    var paidAt = DateTime.UtcNow;
                    invoice.Status = "Completed";
                    invoice.PaidAt = paidAt;
                    invoice.UpdatedAt = paidAt;

                    _context.Payments.Add(new Payment
                    {
                        InvoiceId = invoice.Id,
                        AmountPaid = payload.transferAmount,
                        TransactionCode = payload.referenceCode ?? payload.id.ToString(),
                        PaymentDate = paidAt,
                        Status = "Completed"
                    });

                    if (invoice.BookingDetailId.HasValue)
                    {
                        var detail = matchedBooking.BookingDetails.FirstOrDefault(d => d.Id == invoice.BookingDetailId.Value);
                        if (detail != null) detail.Status = "Completed";
                    }

                    matchedBooking.Status = ResolveBookingStatusFromDetails(matchedBooking.BookingDetails);
                    await _context.SaveChangesAsync();

                    if (matchedBooking.UserId.HasValue)
                    {
                        await _membershipService.AddPointsAsync(matchedBooking.UserId.Value, payload.transferAmount);
                    }
                }
                else
                {
                    // Maybe it's a deposit payment for a pending booking without an invoice yet
                    var paidAt = DateTime.UtcNow;
                    foreach (var detail in matchedBooking.BookingDetails)
                    {
                        if (detail.Status == "Pending") detail.Status = "Confirmed";
                    }
                    matchedBooking.Status = ResolveBookingStatusFromDetails(matchedBooking.BookingDetails);
                    
                    var depositInvoice = new Invoice
                    {
                        BookingId = matchedBooking.Id,
                        BookingDetailId = null,
                        Code = $"CQC-{matchedBooking.BookingCode}-{paidAt:HHmmss}",
                        BookingCode = matchedBooking.BookingCode,
                        RoomName = "Đặt cọc Booking",
                        Status = "Completed",
                        FinalTotal = payload.transferAmount,
                        CreatedAt = paidAt,
                        UpdatedAt = paidAt,
                        PaidAt = paidAt
                    };
                    _context.Invoices.Add(depositInvoice);
                    await _context.SaveChangesAsync();

                    _context.Payments.Add(new Payment
                    {
                        InvoiceId = depositInvoice.Id,
                        AmountPaid = payload.transferAmount,
                        TransactionCode = payload.referenceCode ?? payload.id.ToString(),
                        PaymentDate = paidAt,
                        Status = "Completed"
                    });
                    
                    await _context.SaveChangesAsync();
                    
                    if (matchedBooking.UserId.HasValue)
                    {
                        await _membershipService.AddPointsAsync(matchedBooking.UserId.Value, payload.transferAmount);
                    }
                }

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing Sepay webhook");
                return StatusCode(500, "Internal Server Error");
            }
        }

        private static string ResolveBookingStatusFromDetails(IEnumerable<BookingDetail> details)
        {
            var detailList = details.ToList();
            if (!detailList.Any()) return "Pending";
            if (detailList.All(detail => detail.Status == "Completed")) return "Completed";
            if (detailList.All(detail => detail.Status == "Cancelled")) return "Cancelled";
            if (detailList.Any(detail => detail.Status == "CheckedIn")) return "CheckedIn";
            if (detailList.Any(detail => detail.Status == "Confirmed")) return "Confirmed";
            if (detailList.Any(detail => detail.Status == "Paying")) return "Paying";
            return "Pending";
        }
    }
}
