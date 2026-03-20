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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserManagementResponseDTO>>> GetAll()
        {
            return await _context.Users
                .Include(u => u.Role)
                .Where(u => u.Status == true)
                .Select(u => new UserManagementResponseDTO
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Phone = u.Phone,
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
                RoleId = user.RoleId,
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

