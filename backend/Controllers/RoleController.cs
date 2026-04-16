using backend.Data;
using backend.DTOs.Role;
using backend.Models;
using backend.Security;
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
        [Permission("VIEW_ROLES")]
        public async Task<ActionResult<IEnumerable<RoleResponseDTO>>> GetAll()
        {
            var roles = await _context.Roles
                .AsNoTracking()
                .Select(r => new RoleResponseDTO
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
        [Permission("VIEW_ROLES")]
        public async Task<ActionResult<RoleResponseDTO>> GetById(int id)
        {
            var role = await _context.Roles
                .AsNoTracking()
                .Where(r => r.Id == id)
                .Select(r => new RoleResponseDTO
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

        [HttpGet("permissions")]
        [Permission("VIEW_ROLES")]
        public async Task<ActionResult<IEnumerable<PermissionResponseDTO>>> GetPermissions()
        {
            var permissions = await _context.Permissions
                .AsNoTracking()
                .OrderBy(p => p.Name)
                .Select(p => new PermissionResponseDTO
                {
                    Id = p.Id,
                    Name = p.Name
                })
                .ToListAsync();

            return Ok(permissions);
        }

        [HttpGet("{id:int}/permissions")]
        [Permission("VIEW_ROLES")]
        public async Task<ActionResult<RolePermissionsResponseDTO>> GetRolePermissions(int id)
        {
            var role = await _context.Roles
                .AsNoTracking()
                .Include(r => r.RolePermissions)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (role == null)
            {
                return NotFound();
            }

            return Ok(new RolePermissionsResponseDTO
            {
                RoleId = role.Id,
                RoleName = role.Name,
                Description = role.Description,
                PermissionIds = role.RolePermissions
                    .Select(rp => rp.PermissionId)
                    .Distinct()
                    .OrderBy(permissionId => permissionId)
                    .ToList()
            });
        }

        [HttpPost]
        [Permission("CREATE_ROLES")]
        public async Task<ActionResult<RoleResponseDTO>> Create([FromBody] RoleRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Ten role khong duoc de trong.");
            }

            var normalizedName = request.Name.Trim();
            var exists = await _context.Roles.AnyAsync(r => r.Name == normalizedName);
            if (exists)
            {
                return BadRequest("Ten role da ton tai.");
            }

            var role = new Role
            {
                Name = normalizedName,
                Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim()
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            var response = new RoleResponseDTO
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                UserCount = 0
            };

            return CreatedAtAction(nameof(GetById), new { id = role.Id }, response);
        }

        [HttpPut("{id:int}")]
        [Permission("EDIT_ROLES")]
        public async Task<IActionResult> Update(int id, [FromBody] RoleRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Ten role khong duoc de trong.");
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
                return BadRequest("Ten role da ton tai.");
            }

            role.Name = normalizedName;
            role.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Permission("DELETE_ROLES")]
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
                return BadRequest("Khong the xoa role dang duoc gan cho user.");
            }

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("assign-permission")]
        [Permission("EDIT_ROLES")]
        public async Task<IActionResult> AssignPermission([FromBody] AssignPermissionRequestDTO request)
        {
            if (request.PermissionIds == null)
            {
                return BadRequest("Danh sach permission khong hop le.");
            }

            var role = await _context.Roles
                .Include(r => r.RolePermissions)
                .FirstOrDefaultAsync(r => r.Id == request.RoleId);

            if (role == null)
            {
                return NotFound("Khong tim thay role.");
            }

            var permissionIds = request.PermissionIds
                .Distinct()
                .ToList();

            var existingPermissionIds = await _context.Permissions
                .Where(p => permissionIds.Contains(p.Id))
                .Select(p => p.Id)
                .ToListAsync();

            if (permissionIds.Count > 0 && existingPermissionIds.Count != permissionIds.Count)
            {
                return BadRequest("Mot hoac nhieu permission khong ton tai.");
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
        public async Task<ActionResult<MyPermissionsResponseDTO>> GetMyPermissions()
        {
            var userId = ResolveCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized("Khong xac dinh duoc user hien tai.");
            }

            var user = await _context.Users
                .AsNoTracking()
                .Include(u => u.Role)
                    .ThenInclude(r => r!.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(u => u.Id == userId.Value);

            if (user == null)
            {
                return NotFound("Khong tim thay user.");
            }

            var permissions = user.Role?.RolePermissions
                .Select(rp => rp.Permission)
                .Where(p => p != null)
                .GroupBy(p => p.Id)
                .Select(g => new PermissionResponseDTO
                {
                    Id = g.Key,
                    Name = g.First().Name
                })
                .OrderBy(p => p.Name)
                .ToList() ?? new List<PermissionResponseDTO>();

            return Ok(new MyPermissionsResponseDTO
            {
                UserId = user.Id,
                RoleId = user.RoleId,
                RoleName = user.Role?.Name,
                Permissions = permissions
            });
        }
    }
}
