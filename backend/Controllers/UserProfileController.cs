using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Tags("UserProfile")]
    public class UserProfileController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserProfileController(AppDbContext context)
        {
            _context = context;
        }

        private int ResolveUserId(int? userId)
        {
            if (userId.HasValue) return userId.Value;

            if (Request.Headers.TryGetValue("X-User-Id", out var header) &&
                int.TryParse(header.ToString(), out var parsed))
            {
                return parsed;
            }

            return 1;
        }

        public sealed class UserProfileResponse
        {
            public int Id { get; set; }
            public int? RoleId { get; set; }
            public int? MembershipId { get; set; }
            public string FullName { get; set; } = null!;
            public string Email { get; set; } = null!;
            public string? Phone { get; set; }
            public bool? Status { get; set; }
        }

        [HttpGet("my-profile")]
        public async Task<ActionResult<UserProfileResponse>> MyProfile([FromQuery] int? userId = null)
        {
            var id = ResolveUserId(userId);
            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            return new UserProfileResponse
            {
                Id = user.Id,
                RoleId = user.RoleId,
                MembershipId = user.MembershipId,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Status = user.Status
            };
        }

        public sealed class UpdateProfileRequest
        {
            public int? UserId { get; set; }
            public string? FullName { get; set; }
            public string? Email { get; set; }
            public string? Phone { get; set; }
        }

        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
        {
            var id = ResolveUserId(request.UserId);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(request.FullName)) user.FullName = request.FullName;
            if (!string.IsNullOrWhiteSpace(request.Email)) user.Email = request.Email;
            if (request.Phone != null) user.Phone = request.Phone;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        public sealed class ChangePasswordRequest
        {
            public int? UserId { get; set; }
            public string? CurrentPassword { get; set; }
            public string NewPassword { get; set; } = null!;
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
        {
            var id = ResolveUserId(request.UserId);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            if (!string.IsNullOrEmpty(request.CurrentPassword) &&
                user.PasswordHash != request.CurrentPassword)
            {
                return BadRequest("CurrentPassword is incorrect.");
            }

            user.PasswordHash = request.NewPassword;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("upload-avatar")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(20_000_000)]
        public async Task<ActionResult<object>> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("Empty file.");

            var ext = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid():N}{ext}";
            var dir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "avatars");
            Directory.CreateDirectory(dir);
            var path = Path.Combine(dir, fileName);

            await using (var stream = System.IO.File.Create(path))
            {
                await file.CopyToAsync(stream);
            }

            var publicUrl = $"/avatars/{fileName}";
            return Ok(new { url = publicUrl });
        }
    }
}

