using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Security;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/user-payment-methods")]
    [Tags("User Payment Methods")]
    public class UserPaymentMethodsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserPaymentMethodsController(AppDbContext context)
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

        [HttpGet]
        [Permission]
        public async Task<ActionResult<IEnumerable<UserPaymentMethod>>> GetMyMethods()
        {
            var userId = ResolveCurrentUserId();
            if (!userId.HasValue) return Unauthorized();

            var methods = await _context.UserPaymentMethods
                .Where(m => m.UserId == userId.Value)
                .OrderByDescending(m => m.IsDefault)
                .ThenByDescending(m => m.CreatedAt)
                .ToListAsync();

            return Ok(methods);
        }

        [HttpPost]
        [Permission]
        public async Task<ActionResult<UserPaymentMethod>> CreateMethod([FromBody] UserPaymentMethod method)
        {
            var userId = ResolveCurrentUserId();
            if (!userId.HasValue) return Unauthorized();

            // Simple validation (mock for real card validation)
            if (string.IsNullOrWhiteSpace(method.Last4Digits) || method.Last4Digits.Length != 4)
            {
                return BadRequest(new { message = "Số thẻ không hợp lệ." });
            }

            method.UserId = userId.Value;
            method.CreatedAt = DateTime.Now;

            // If it's the first method, make it default
            var existingCount = await _context.UserPaymentMethods.CountAsync(m => m.UserId == userId.Value);
            if (existingCount == 0)
            {
                method.IsDefault = true;
            }
            else if (method.IsDefault)
            {
                // If this is set as default, unset others
                var otherDefaults = await _context.UserPaymentMethods
                    .Where(m => m.UserId == userId.Value && m.IsDefault)
                    .ToListAsync();
                foreach (var m in otherDefaults) m.IsDefault = false;
            }

            _context.UserPaymentMethods.Add(method);
            await _context.SaveChangesAsync();

            return Ok(method);
        }

        [HttpDelete("{id}")]
        [Permission]
        public async Task<IActionResult> DeleteMethod(int id)
        {
            var userId = ResolveCurrentUserId();
            if (!userId.HasValue) return Unauthorized();

            var method = await _context.UserPaymentMethods
                .FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId.Value);

            if (method == null) return NotFound();

            _context.UserPaymentMethods.Remove(method);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
