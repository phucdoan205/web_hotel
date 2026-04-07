using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MembershipsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MembershipsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMemberships()
        {
            return Ok(await _context.Memberships.OrderBy(m => m.MinPoints).ToListAsync());
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetMembershipUsers()
        {
            var users = await _context.Users
                .Include(u => u.Membership)
                .Where(u => u.TotalSpending > 0 || u.MembershipId != null || u.IsBlacklisted)
                .OrderByDescending(u => u.TotalSpending)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.TotalSpending,
                    TierName = u.IsBlacklisted ? "Banned (Khóa Hạng)" : (u.Membership != null ? u.Membership.TierName : "Chưa có hạng"),
                    u.IsBlacklisted
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMembership([FromBody] Membership membership)
        {
            _context.Memberships.Add(membership);
            await _context.SaveChangesAsync();
            return Ok(membership);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMembership(int id, [FromBody] Membership update)
        {
            var membership = await _context.Memberships.FindAsync(id);
            if (membership == null) return NotFound();

            membership.TierName = update.TierName;
            membership.MinPoints = update.MinPoints; // Now used as MinSpending internally based on our definition
            membership.DiscountPercent = update.DiscountPercent;
            membership.Description = update.Description;

            await _context.SaveChangesAsync();
            return Ok(membership);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMembership(int id)
        {
            var membership = await _context.Memberships.FindAsync(id);
            if (membership == null) return NotFound();
            _context.Memberships.Remove(membership);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
