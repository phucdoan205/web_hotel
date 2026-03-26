using backend.Data;
using backend.DTOs;
using backend.DTOs.User;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Tags("UserManagement")]
    public class UserManagementController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserManagementController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("staff")]
        public async Task<ActionResult<IEnumerable<UserManagementResponseDTO>>> GetStaff([FromQuery] bool includeInactive = true)
        {
            var staffRoleIds = new[] { 1, 4, 5 };

            var query = _context.Users
                .AsNoTracking()
                .Include(u => u.Role)
                .Where(u => u.RoleId.HasValue && staffRoleIds.Contains(u.RoleId.Value));

            if (!includeInactive)
            {
                query = query.Where(u => u.Status == true);
            }

            var staff = await query
                .OrderBy(u => u.Role!.Name)
                .ThenBy(u => u.FullName)
                .Select(u => new UserManagementResponseDTO
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Phone = u.Phone,
                    AvatarUrl = u.AvatarUrl,
                    RoleId = u.RoleId,
                    RoleName = u.Role != null ? u.Role.Name : null,
                    Status = u.Status
                })
                .ToListAsync();

            return Ok(staff);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserManagementResponseDTO>>> GetAll()
        {
            return await _context.Users
                .AsNoTracking()
                .Include(u => u.Role)
                .Where(u => u.Status == true)
                .Select(u => new UserManagementResponseDTO
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Phone = u.Phone,
                    AvatarUrl = u.AvatarUrl,
                    RoleId = u.RoleId,
                    RoleName = u.Role != null ? u.Role.Name : null,
                    Status = u.Status
                })
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<UserManagementResponseDTO>> Create(UserCreateDTO request)
        {
            var user = new User
            {
                RoleId = request.RoleId,
                MembershipId = request.MembershipId,
                FullName = request.FullName,
                Email = request.Email,
                Phone = request.Phone,
                GoogleId = request.GoogleId,
                AvatarUrl = request.AvatarUrl,
                DateOfBirth = request.DateOfBirth,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Status = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new UserManagementResponseDTO {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                AvatarUrl = user.AvatarUrl,
                RoleId = user.RoleId,
                Status = user.Status
            });
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<UserManagementResponseDTO>> Update(int id, UserUpdateDTO request)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(request.FullName))
            {
                user.FullName = request.FullName.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                user.Email = request.Email.Trim();
            }

            if (request.Phone != null)
            {
                user.Phone = request.Phone.Trim();
            }

            if (request.AvatarUrl != null)
            {
                user.AvatarUrl = string.IsNullOrWhiteSpace(request.AvatarUrl)
                    ? null
                    : request.AvatarUrl.Trim();
            }

            if (request.DateOfBirth.HasValue)
            {
                user.DateOfBirth = request.DateOfBirth.Value;
            }

            if (request.RoleId.HasValue)
            {
                user.RoleId = request.RoleId.Value;
            }

            if (request.Status.HasValue)
            {
                user.Status = request.Status.Value;
            }

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }

            await _context.SaveChangesAsync();

            await _context.Entry(user).Reference(u => u.Role).LoadAsync();

            return Ok(new UserManagementResponseDTO
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                AvatarUrl = user.AvatarUrl,
                RoleId = user.RoleId,
                RoleName = user.Role?.Name,
                Status = user.Status
            });
        }

        [HttpPut("{id:int}/change-role")]
        public async Task<IActionResult> ChangeRole(int id, ChangeRoleRequestDTO request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.RoleId = request.NewRoleId;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.Status = false;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

