using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/Roles")]
    [Tags("Role")]
    public class RoleController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoleController(AppDbContext context)
        {
            _context = context;
        }

        public sealed class RoleRequest
        {
            public string Name { get; set; } = null!;
            public string? Description { get; set; }
        }

        public sealed class RoleResponse
        {
            public int Id { get; set; }
            public string Name { get; set; } = null!;
            public string? Description { get; set; }
            public int UserCount { get; set; }
        }

        public sealed class AssignPermissionRequest
        {
            public int RoleId { get; set; }
            public List<int> PermissionIds { get; set; } = new();
        }

        public sealed class PermissionResponse
        {
            public int Id { get; set; }
            public string Name { get; set; } = null!;
        }

        public sealed class MyPermissionsResponse
        {
            public int UserId { get; set; }
            public int? RoleId { get; set; }
            public string? RoleName { get; set; }
            public List<PermissionResponse> Permissions { get; set; } = new();
        }

        private int? ResolveCurrentUserId()
        {
            var claimValue =
                User.FindFirstValue(JwtRegisteredClaimNames.NameId) ??
                User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                User.FindFirstValue("nameid");

            if (int.TryParse(claimValue, out var claimUserId))
            {
                return claimUserId;
            }

            if (Request.Headers.TryGetValue("X-User-Id", out var headerValue) &&
                int.TryParse(headerValue.ToString(), out var headerUserId))
            {
                return headerUserId;
            }

            return null;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoleResponse>>> GetAll()
        {
            var roles = await _context.Roles
                .AsNoTracking()
                .Select(r => new RoleResponse
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    UserCount = r.Users.Count
                })
                .OrderBy(r => r.Name)
                .ToListAsync();

            return Ok(roles);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<RoleResponse>> GetById(int id)
        {
            var role = await _context.Roles
                .AsNoTracking()
                .Where(r => r.Id == id)
                .Select(r => new RoleResponse
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    UserCount = r.Users.Count
                })
                .FirstOrDefaultAsync();

            if (role == null)
            {
                return NotFound();
            }

            return Ok(role);
        }

        [HttpPost]
        public async Task<ActionResult<RoleResponse>> Create([FromBody] RoleRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Tên role không được để trống.");
            }

            var normalizedName = request.Name.Trim();
            var exists = await _context.Roles.AnyAsync(r => r.Name == normalizedName);
            if (exists)
            {
                return BadRequest("Tên role đã tồn tại.");
            }

            var role = new Role
            {
                Name = normalizedName,
                Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim()
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            var response = new RoleResponse
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                UserCount = 0
            };

            return CreatedAtAction(nameof(GetById), new { id = role.Id }, response);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] RoleRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Tên role không được để trống.");
            }

            var role = await _context.Roles.FindAsync(id);
            if (role == null)
            {
                return NotFound();
            }

            var normalizedName = request.Name.Trim();
            var duplicatedName = await _context.Roles.AnyAsync(r => r.Id != id && r.Name == normalizedName);
            if (duplicatedName)
            {
                return BadRequest("Tên role đã tồn tại.");
            }

            role.Name = normalizedName;
            role.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var role = await _context.Roles
                .Include(r => r.Users)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (role == null)
            {
                return NotFound();
            }

            if (role.Users.Any())
            {
                return BadRequest("Không thể xóa role đang được gán cho user.");
            }

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("assign-permission")]
        public async Task<IActionResult> AssignPermission([FromBody] AssignPermissionRequest request)
        {
            if (request.PermissionIds == null || request.PermissionIds.Count == 0)
            {
                return BadRequest("Danh sách permission không được để trống.");
            }

            var role = await _context.Roles
                .Include(r => r.RolePermissions)
                .FirstOrDefaultAsync(r => r.Id == request.RoleId);

            if (role == null)
            {
                return NotFound("Không tìm thấy role.");
            }

            var permissionIds = request.PermissionIds
                .Distinct()
                .ToList();

            var existingPermissionIds = await _context.Permissions
                .Where(p => permissionIds.Contains(p.Id))
                .Select(p => p.Id)
                .ToListAsync();

            if (existingPermissionIds.Count != permissionIds.Count)
            {
                return BadRequest("Một hoặc nhiều permission không tồn tại.");
            }

            _context.RolePermissions.RemoveRange(role.RolePermissions);

            var rolePermissions = permissionIds.Select(permissionId => new RolePermission
            {
                RoleId = request.RoleId,
                PermissionId = permissionId
            });

            await _context.RolePermissions.AddRangeAsync(rolePermissions);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("my-permissions")]
        public async Task<ActionResult<MyPermissionsResponse>> GetMyPermissions()
        {
            var userId = ResolveCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized("Không xác định được user hiện tại.");
            }

            var user = await _context.Users
                .AsNoTracking()
                .Include(u => u.Role)
                    .ThenInclude(r => r!.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(u => u.Id == userId.Value);

            if (user == null)
            {
                return NotFound("Không tìm thấy user.");
            }

            var permissions = user.Role?.RolePermissions
                .Select(rp => rp.Permission)
                .Where(p => p != null)
                .GroupBy(p => p.Id)
                .Select(g => new PermissionResponse
                {
                    Id = g.Key,
                    Name = g.First().Name
                })
                .OrderBy(p => p.Name)
                .ToList() ?? new List<PermissionResponse>();

            return Ok(new MyPermissionsResponse
            {
                UserId = user.Id,
                RoleId = user.RoleId,
                RoleName = user.Role?.Name,
                Permissions = permissions
            });
        }
    }
}
