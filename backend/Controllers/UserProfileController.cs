using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.RegularExpressions;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Tags("UserProfile")]
    public class UserProfileController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly CloudinaryService _cloudinaryService;

        public UserProfileController(AppDbContext context, CloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
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

        private static string BuildFolderSafeUserName(string fullName, int userId)
        {
            var raw = string.IsNullOrWhiteSpace(fullName) ? $"user-{userId}" : fullName.Trim();
            var normalized = raw.Normalize(NormalizationForm.FormD);
            var builder = new StringBuilder();

            foreach (var ch in normalized)
            {
                var category = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(ch);
                if (category != System.Globalization.UnicodeCategory.NonSpacingMark)
                {
                    builder.Append(ch);
                }
            }

            var withoutDiacritics = builder.ToString().Normalize(NormalizationForm.FormC);
            var safe = Regex.Replace(withoutDiacritics, "[^a-zA-Z0-9_-]+", "-").Trim('-');

            return string.IsNullOrWhiteSpace(safe) ? $"user-{userId}" : safe;
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
        public async Task<ActionResult<object>> UploadAvatar(IFormFile file, [FromForm] int? userId = null)
        {
            if (file == null || file.Length == 0) return BadRequest("Empty file.");

            var id = ResolveUserId(userId);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound("User not found.");

            var userFolderName = BuildFolderSafeUserName(user.FullName, user.Id);
            var folder = $"Home/Profile/{userFolderName}";
            var uploadedUrl = await _cloudinaryService.UploadImageAsync(file, folder);

            if (string.IsNullOrWhiteSpace(uploadedUrl))
            {
                return StatusCode(500, "Upload to Cloudinary failed.");
            }

            user.AvatarUrl = uploadedUrl;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                userId = user.Id,
                fullName = user.FullName,
                folder,
                url = uploadedUrl
            });
        }
    }
}
