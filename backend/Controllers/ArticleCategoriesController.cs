using backend.Data;
using backend.DTOs.Article;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArticleCategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ArticleCategoriesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.ArticleCategories
                .Include(c => c.Articles)
                .Select(c => new ArticleCategoryDTO
                {
                    Id = c.Id,
                    Name = c.Name,
                    Status = c.Status,
                    ArticleCount = c.Articles.Count
                })
                .AsNoTracking()
                .ToListAsync();

            return Ok(categories);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CreateArticleCategoryDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Tên danh mục không được để trống.");
            }

            var category = new Models.ArticleCategory
            {
                Name = request.Name.Trim(),
                Status = true
            };

            _context.ArticleCategories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(new ArticleCategoryDTO
            {
                Id = category.Id,
                Name = category.Name,
                Status = category.Status,
                ArticleCount = 0
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CreateArticleCategoryDTO request)
        {
            var category = await _context.ArticleCategories.FindAsync(id);
            if (category == null) return NotFound();

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Tên danh mục không được để trống.");
            }

            category.Name = request.Name.Trim();
            await _context.SaveChangesAsync();

            return Ok(new ArticleCategoryDTO
            {
                Id = category.Id,
                Name = category.Name,
                Status = category.Status,
                ArticleCount = await _context.Articles.CountAsync(a => a.CategoryId == id)
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.ArticleCategories
                .Include(c => c.Articles)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null) return NotFound();

            if (category.Articles.Any())
            {
                return BadRequest("Không thể xóa danh mục này vì đã có bài viết thuộc danh mục.");
            }

            _context.ArticleCategories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa danh mục thành công." });
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var category = await _context.ArticleCategories.FindAsync(id);
            if (category == null) return NotFound();

            category.Status = !category.Status;
            await _context.SaveChangesAsync();

            return Ok(new { status = category.Status });
        }
    }
}
