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
                .Select(c => new ArticleCategoryDTO
                {
                    Id = c.Id,
                    Name = c.Name
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
                return BadRequest("Name is required.");
            }

            var category = new Models.ArticleCategory
            {
                Name = request.Name.Trim()
            };

            _context.ArticleCategories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(new ArticleCategoryDTO
            {
                Id = category.Id,
                Name = category.Name
            });
        }
    }
}
