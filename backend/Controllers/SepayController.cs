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
                
                // TODO: Verify HMAC if needed. In SePay, sometimes it's passed in the headers.
                // For now, let's just parse the payload
                var payload = JsonSerializer.Deserialize<SepayWebhookDTO>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (payload == null || payload.transferType != "in")
                {
                    return Ok(new { success = true, message = "Ignored or invalid payload" });
                }

                _logger.LogInformation("Received Sepay Webhook: Amount={Amount}, Content={Content}", payload.transferAmount, payload.content);

                // Parse Booking Code from content (assuming user enters something like 'Thanh toan HD123' or just 'HD123')
                // Let's find any booking code matching our format (e.g. BOOKING-...) or just search all pending bookings.
                // Or better, let's look for the BookingId or BookingCode in the content.
                var bookings = await _context.Bookings
                    .Include(b => b.BookingDetails)
                    .Where(b => b.Status != "Cancelled")
                    .ToListAsync();

                Booking? matchedBooking = null;
                foreach (var b in bookings)
                {
                    if (payload.content.Contains(b.BookingCode, StringComparison.OrdinalIgnoreCase))
                    {
                        matchedBooking = b;
                        break;
                    }
                }

                if (matchedBooking == null)
                {
                    _logger.LogWarning("Sepay Webhook: Could not find booking matching content: {Content}", payload.content);
                    return Ok(new { success = true, message = "No matching booking found" }); // Return 200 so SePay doesn't retry
                }

                // Create payment record and complete invoices/booking
                var invoice = await _context.Invoices
                    .FirstOrDefaultAsync(i => i.BookingId == matchedBooking.Id && i.Status != "Completed");

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
