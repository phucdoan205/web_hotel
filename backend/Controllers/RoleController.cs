using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
    }
}
