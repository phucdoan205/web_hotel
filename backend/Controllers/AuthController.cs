using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;
using backend.Data;
using backend.DTOs.Auth;
using backend.Models;
using backend.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private const int DefaultGoogleUserRoleId = 2;
        private const int DefaultRegisterUserRoleId = 2;

        private readonly AppDbContext _context;
        private readonly IJwtService _jwtService;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly NotificationService _notificationService;
        public AuthController(
            AppDbContext context,
            IJwtService jwtService,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            NotificationService notificationService)
        {
            _context = context;
            _jwtService = jwtService;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _notificationService = notificationService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (string.IsNullOrWhiteSpace(loginDto.Email) || string.IsNullOrWhiteSpace(loginDto.Password))
            {
                return BadRequest(new { message = "Email and password are required." });
            }

            var normalizedEmail = loginDto.Email.Trim();

            var user = await _context.Users
                .Include(u => u.Role)
                    .ThenInclude(role => role!.RolePermissions)
                    .ThenInclude(rolePermission => rolePermission.Permission)
                .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

            if (user == null || user.Status != true || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Email or password is incorrect." });
            }

            return Ok(BuildAuthResponse(user));
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] LoginDto loginDto)
        {
            if (string.IsNullOrWhiteSpace(loginDto.GoogleCredential))
            {
                return BadRequest(new { message = "Google credential is required." });
            }

            var googlePayload = await VerifyGoogleCredentialAsync(loginDto.GoogleCredential);
            if (googlePayload == null || string.IsNullOrWhiteSpace(googlePayload.Sub) || string.IsNullOrWhiteSpace(googlePayload.Email))
            {
                return Unauthorized(new { message = "Google login is invalid." });
            }

            var normalizedEmail = googlePayload.Email.Trim();
            var normalizedGoogleId = googlePayload.Sub.Trim();

            var user = await _context.Users
                .Include(u => u.Role)
                    .ThenInclude(role => role!.RolePermissions)
                    .ThenInclude(rolePermission => rolePermission.Permission)
                .FirstOrDefaultAsync(u =>
                    (u.GoogleId != null && u.GoogleId == normalizedGoogleId) ||
                    u.Email == normalizedEmail);

            if (user == null)
            {
                user = new User
                {
                    RoleId = DefaultGoogleUserRoleId,
                    FullName = string.IsNullOrWhiteSpace(googlePayload.Name) ? normalizedEmail : googlePayload.Name.Trim(),
                    Email = normalizedEmail,
                    GoogleId = normalizedGoogleId,
                    AvatarUrl = string.IsNullOrWhiteSpace(googlePayload.Picture) ? null : googlePayload.Picture.Trim(),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(Convert.ToHexString(RandomNumberGenerator.GetBytes(32))),
                    Status = true
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                await _context.Entry(user).Reference(u => u.Role).LoadAsync();
                if (user.Role != null)
                {
                    await _context.Entry(user.Role)
                        .Collection(role => role.RolePermissions)
                        .Query()
                        .Include(rolePermission => rolePermission.Permission)
                        .LoadAsync();
                }

                await _notificationService.CreateAsync(
                    "New Google User",
                    $"{user.FullName} created a new account with Google.",
                    "Success",
                    "/admin/staff");

                return Ok(BuildAuthResponse(user));
            }

            if (user.Status != true)
            {
                return Unauthorized(new { message = "This account is inactive." });
            }

            var hasChanges = false;

            if (string.IsNullOrWhiteSpace(user.GoogleId))
            {
                user.GoogleId = normalizedGoogleId;
                hasChanges = true;
            }

            if (string.IsNullOrWhiteSpace(user.AvatarUrl) && !string.IsNullOrWhiteSpace(googlePayload.Picture))
            {
                user.AvatarUrl = googlePayload.Picture.Trim();
                hasChanges = true;
            }

            if (string.IsNullOrWhiteSpace(user.FullName) && !string.IsNullOrWhiteSpace(googlePayload.Name))
            {
                user.FullName = googlePayload.Name.Trim();
                hasChanges = true;
            }

            if (hasChanges)
            {
                await _context.SaveChangesAsync();
            }

            return Ok(BuildAuthResponse(user));
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (string.IsNullOrWhiteSpace(registerDto.FullName) ||
                string.IsNullOrWhiteSpace(registerDto.Email) ||
                string.IsNullOrWhiteSpace(registerDto.Password))
            {
                return BadRequest(new { message = "Vui lòng nhập đầy đủ họ tên, email và mật khẩu." });
            }

            if (!registerDto.AgreeTerms)
            {
                return BadRequest(new { message = "Bạn phải đồng ý với Điều khoản và Điều kiện." });
            }

            var normalizedEmail = registerDto.Email.Trim();

            var emailExists = await _context.Users.AnyAsync(u => u.Email == normalizedEmail);
            if (emailExists)
            {
                return Conflict(new { message = "Email đã tồn tại." });
            }

            var user = new User
            {
                RoleId = DefaultRegisterUserRoleId,
                FullName = registerDto.FullName.Trim(),
                Email = normalizedEmail,
                Phone = string.IsNullOrWhiteSpace(registerDto.PhoneNumber)
                    ? null
                    : registerDto.PhoneNumber.Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                Status = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            await _context.Entry(user).Reference(u => u.Role).LoadAsync();
            if (user.Role != null)
            {
                await _context.Entry(user.Role)
                    .Collection(role => role.RolePermissions)
                    .Query()
                    .Include(rolePermission => rolePermission.Permission)
                    .LoadAsync();
            }

            await _notificationService.CreateAsync(
                "Tài khoản mới",
                $"{user.FullName} vừa đăng ký tài khoản mới.",
                "Success",
                "/admin/staff");

            return Ok(BuildAuthResponse(user));
        }

        [HttpGet("check-email")]
        public async Task<ActionResult<EmailCheckResponseDto>> CheckEmail([FromQuery] string? email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return Ok(new EmailCheckResponseDto { Exists = false });
            }

            var normalizedEmail = email.Trim();
            var exists = await _context.Users.AnyAsync(u => u.Email == normalizedEmail);

            return Ok(new EmailCheckResponseDto { Exists = exists });
        }

        private AuthResponseDto BuildAuthResponse(User user)
        {
            var permissions = user.Role?.RolePermissions
                .Select(rolePermission => rolePermission.Permission?.Name)
                .Where(permissionName => !string.IsNullOrWhiteSpace(permissionName))
                .Select(permissionName => permissionName!)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(permissionName => permissionName)
                .ToList() ?? new List<string>();

            var token = _jwtService.CreateToken(user, permissions);

            return new AuthResponseDto
            {
                Token = token,
                UserId = user.Id,
                FullName = user.FullName,
                Role = user.Role?.Name,
                RoleId = user.RoleId,
                GoogleId = user.GoogleId,
                Email = user.Email,
                AvatarUrl = user.AvatarUrl,
                Permissions = permissions
            };
        }

        private async Task<GoogleTokenInfoDto?> VerifyGoogleCredentialAsync(string credential)
        {
            var client = _httpClientFactory.CreateClient();
            var encodedCredential = Uri.EscapeDataString(credential);
            var response = await client.GetAsync($"https://oauth2.googleapis.com/tokeninfo?id_token={encodedCredential}");

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var payload = await response.Content.ReadFromJsonAsync<GoogleTokenInfoDto>();
            if (payload == null)
            {
                return null;
            }

            var expectedAudience = _configuration["GoogleAuth:ClientId"];
            if (!string.IsNullOrWhiteSpace(expectedAudience) &&
                !string.Equals(payload.Audience, expectedAudience, StringComparison.Ordinal))
            {
                return null;
            }

            return payload;
        }

        private sealed class GoogleTokenInfoDto
        {
            [JsonPropertyName("sub")]
            public string? Sub { get; set; }

            [JsonPropertyName("email")]
            public string? Email { get; set; }

            [JsonPropertyName("name")]
            public string? Name { get; set; }

            [JsonPropertyName("picture")]
            public string? Picture { get; set; }

            [JsonPropertyName("aud")]
            public string? Audience { get; set; }
        }
    }
}
