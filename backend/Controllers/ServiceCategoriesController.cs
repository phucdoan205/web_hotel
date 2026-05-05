using backend.Data;
using backend.DTOs.Service;
using backend.Models;
using backend.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Tags("ServiceCategories")]
    public class ServiceCategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ServiceCategoriesController(AppDbContext context)
        {
            _context = context;
        }

        private static ServiceCategoryResponseDTO MapCategory(ServiceCategory category) => new()
        {
            Id = category.Id,
            Name = category.Name,
            Status = category.Status
        };

        [HttpGet]
        [Permission("VIEW_SERVICES")]
        public async Task<ActionResult<IEnumerable<ServiceCategoryResponseDTO>>> GetCategories()
        {
            var categories = await _context.ServiceCategories
                .AsNoTracking()
                .OrderByDescending(c => c.Status)
                .ThenBy(c => c.Name)
                .ToListAsync();

            return Ok(categories.Select(MapCategory));
        }

        [HttpPost]
        [Permission("CREATE_SERVICES")]
        public async Task<ActionResult<ServiceCategoryResponseDTO>> CreateCategory([FromBody] ServiceCategoryUpsertDTO request)
        {
            var category = new ServiceCategory
            {
                Name = request.Name.Trim(),
                Status = request.Status
            };

            _context.ServiceCategories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, MapCategory(category));
        }

        [HttpPut("{id:int}")]
        [Permission("EDIT_SERVICES")]
        public async Task<ActionResult<ServiceCategoryResponseDTO>> UpdateCategory(int id, [FromBody] ServiceCategoryUpsertDTO request)
        {
            var category = await _context.ServiceCategories.FirstOrDefaultAsync(c => c.Id == id);
            if (category == null)
            {
                return NotFound("Không tìm thấy nhóm dịch vụ.");
            }

            category.Name = request.Name.Trim();
            category.Status = request.Status;

            await _context.SaveChangesAsync();

            return Ok(MapCategory(category));
        }

        [HttpDelete("{id:int}")]
        [Permission("DELETE_SERVICES")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.ServiceCategories
                .Include(c => c.Services)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound("Không tìm thấy nhóm dịch vụ.");
            }

            if (category.Services.Any())
            {
                return BadRequest("Không thể xóa nhóm dịch vụ này vì đang có dịch vụ thuộc nhóm.");
            }

            _context.ServiceCategories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
