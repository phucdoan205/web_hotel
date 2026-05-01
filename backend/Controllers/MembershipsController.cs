using backend.Data;
using backend.DTOs.Membership;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
            var memberships = await _context.Memberships
                .Select(m => new MembershipDTO
                {
                    Id = m.Id,
                    TierName = m.TierName,
                    MinPoints = m.MinPoints,
                    DiscountPercent = m.DiscountPercent,
                    Description = m.Description
                })
                .ToListAsync();

            return Ok(memberships);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMembership([FromBody] CreateMembershipDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.TierName))
            {
                return BadRequest("Tên hạng thành viên không được để trống.");
            }

            var membership = new Membership
            {
                TierName = request.TierName,
                MinPoints = request.MinPoints,
                DiscountPercent = request.DiscountPercent,
                Description = request.Description
            };

            _context.Memberships.Add(membership);
            await _context.SaveChangesAsync();

            return Ok(new MembershipDTO
            {
                Id = membership.Id,
                TierName = membership.TierName,
                MinPoints = membership.MinPoints,
                DiscountPercent = membership.DiscountPercent,
                Description = membership.Description
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMembership(int id, [FromBody] CreateMembershipDTO request)
        {
            var membership = await _context.Memberships.FindAsync(id);
            if (membership == null) return NotFound();

            if (string.IsNullOrWhiteSpace(request.TierName))
            {
                return BadRequest("Tên hạng thành viên không được để trống.");
            }

            membership.TierName = request.TierName;
            membership.MinPoints = request.MinPoints;
            membership.DiscountPercent = request.DiscountPercent;
            membership.Description = request.Description;

            await _context.SaveChangesAsync();

            return Ok(new MembershipDTO
            {
                Id = membership.Id,
                TierName = membership.TierName,
                MinPoints = membership.MinPoints,
                DiscountPercent = membership.DiscountPercent,
                Description = membership.Description
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMembership(int id)
        {
            var membership = await _context.Memberships
                .Include(m => m.Users)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (membership == null) return NotFound();

            if (membership.Users.Any())
            {
                return BadRequest("Không thể xóa hạng thành viên này vì đang có khách hàng thuộc hạng này.");
            }

            _context.Memberships.Remove(membership);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa hạng thành viên thành công." });
        }
    }
}
