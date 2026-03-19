using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;

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
        public async Task<IActionResult> GetCategories() => Ok(await _context.ArticleCategories.ToListAsync());

        [HttpPost]
        public async Task<IActionResult> CreateCategory(ArticleCategory category)
        {
            _context.ArticleCategories.Add(category);
            await _context.SaveChangesAsync();
            return Ok(category);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, ArticleCategory category)
        {
            if (id != category.Id) return BadRequest("Lỗi ID không khớp");
            _context.Entry(category).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.ArticleCategories.FindAsync(id);
            if (category == null) return NotFound();
            _context.ArticleCategories.Remove(category);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}