using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CheckoutController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CheckoutController(AppDbContext context)
        {
            _context = context;
        }

        public class CheckoutProcessDto
        {
            public int? BookingId { get; set; }
            public int? UserId { get; set; }
            public decimal RoomAmount { get; set; }
            public decimal ServiceAmount { get; set; }
            public decimal DamagedItemsFee { get; set; }
            public decimal DiscountAmount { get; set; }
            public bool IsBlacklisted { get; set; }
        }

        [HttpPost("process")]
        public async Task<IActionResult> ProcessCheckout([FromBody] CheckoutProcessDto dto)
        {
            try
            {
                // 1. Calculate totals
                decimal finalTotal = dto.RoomAmount + dto.ServiceAmount + dto.DamagedItemsFee - dto.DiscountAmount;
            if (finalTotal < 0) finalTotal = 0;

            // 2. Format Invoice
            var invoice = new Invoice
            {
                BookingId = dto.BookingId,
                TotalRoomAmount = dto.RoomAmount,
                TotalServiceAmount = dto.ServiceAmount + dto.DamagedItemsFee, // Combine services and damage
                DiscountAmount = dto.DiscountAmount,
                TaxAmount = 0,
                FinalTotal = finalTotal,
                Status = "Paid"
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            // 3. Register Payment
            var payment = new Payment
            {
                InvoiceId = invoice.Id,
                AmountPaid = finalTotal,
                PaymentDate = DateTime.UtcNow,
                Status = "Completed"
            };

            _context.Payments.Add(payment);

            // 4. Update User Spending & Membership & Blacklist
            if (dto.UserId.HasValue)
            {
                var user = await _context.Users.FindAsync(dto.UserId.Value);
                if (user != null)
                {
                    // Đánh dấu thái độ / Blacklist
                    if (dto.IsBlacklisted)
                    {
                        user.IsBlacklisted = true;
                        user.MembershipId = null; // Tước bỏ hạng thành viên nếu bị blacklist
                    }
                    
                    // Cập nhật tổng chi tiêu (Cộng dồn nhiều lần)
                    user.TotalSpending += finalTotal;

                    // Xét thăng hạng nếu KHÔNG bị blacklist
                    if (!user.IsBlacklisted)
                    {
                        var newTier = await _context.Memberships
                            .Where(m => m.MinPoints <= user.TotalSpending)
                            .OrderByDescending(m => m.MinPoints)
                            .FirstOrDefaultAsync();

                        if (newTier != null)
                        {
                            user.MembershipId = newTier.Id;
                        }
                    }
                }
            }

            // 5. Update Booking Status
            if (dto.BookingId.HasValue)
            {
                var booking = await _context.Bookings.FindAsync(dto.BookingId.Value);
                if (booking != null)
                {
                    booking.Status = "CheckedOut";
                }
            }

            await _context.SaveChangesAsync();

                return Ok(new { 
                    message = "Checkout and Payment processed successfully.", 
                    invoiceId = invoice.Id,
                    finalTotal = finalTotal
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error during checkout: " + ex.Message, stack = ex.StackTrace });
            }
        }
    }
}
