using backend.Data;
using backend.DTOs.User;
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
        private readonly NotificationService _notificationService;

        public UserProfileController(
            AppDbContext context,
            CloudinaryService cloudinaryService,
            NotificationService notificationService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
            _notificationService = notificationService;
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

        [HttpGet("my-profile")]
        public async Task<ActionResult<UserProfileResponseDTO>> MyProfile([FromQuery] int? userId = null)
        {
            var id = ResolveUserId(userId);
            var user = await _context.Users
                .AsNoTracking()
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            return new UserProfileResponseDTO
            {
                Id = user.Id,
                RoleId = user.RoleId,
                MembershipId = user.MembershipId,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                AvatarUrl = user.AvatarUrl,
                DateOfBirth = user.DateOfBirth,
                RoleName = user.Role?.Name,
                Status = user.Status
            };
        }

        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileRequestDTO request)
        {
            var id = ResolveUserId(request.UserId);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(request.FullName)) user.FullName = request.FullName;
            if (request.Phone != null) user.Phone = request.Phone;
            user.DateOfBirth = request.DateOfBirth;

            await _context.SaveChangesAsync();

            await _notificationService.CreateAsync(
                "Profile Updated",
                $"{user.FullName} updated their profile information.",
                "Info",
                "/admin/settings");

            return NoContent();
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordRequestDTO request)
        {
            var id = ResolveUserId(request.UserId);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            if (!string.IsNullOrEmpty(request.CurrentPassword) &&
                !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            {
                return BadRequest("CurrentPassword is incorrect.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("upload-avatar")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(20_000_000)]
        public async Task<ActionResult<UploadAvatarResponseDTO>> UploadAvatar(IFormFile file, [FromForm] int? userId = null)
        {
            if (file == null || file.Length == 0) return BadRequest("Empty file.");

            var id = ResolveUserId(userId);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound("User not found.");

            var userFolderName = BuildFolderSafeUserName(user.FullName, user.Id);
            var folder = $"Home/Profile/{userFolderName}";
            var oldAvatarUrl = user.AvatarUrl;
            var uploadedUrl = await _cloudinaryService.UploadImageAsync(file, folder);

            if (string.IsNullOrWhiteSpace(uploadedUrl))
            {
                return StatusCode(500, "Upload to Cloudinary failed.");
            }

            user.AvatarUrl = uploadedUrl;
            await _context.SaveChangesAsync();
            await _cloudinaryService.DeleteImageByUrlAsync(oldAvatarUrl);

            await _notificationService.CreateAsync(
                "Avatar Updated",
                $"{user.FullName} updated their profile photo.",
                "Info",
                "/admin/settings");

            return Ok(new UploadAvatarResponseDTO
            {
                UserId = user.Id,
                FullName = user.FullName,
                Folder = folder,
                Url = uploadedUrl
            });
        }
    }
}
