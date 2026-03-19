using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArticlesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ArticlesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetArticles()
        {
            var data = await _context.Articles
                .Include(a => a.ArticleCategory)
                .Select(a => new {
                    a.Id, a.Title, a.Slug, a.Thumbnail, a.Content, a.ArticleCategoryId, CategoryName = a.ArticleCategory.Name
                })
                .ToListAsync();
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> CreateArticle(Article article)
        {
            _context.Articles.Add(article);
            await _context.SaveChangesAsync();
            return Ok(article);
        }

        [HttpGet("{slug}")]
        public async Task<IActionResult> GetArticleBySlug(string slug)
        {
            var article = await _context.Articles
                .Include(a => a.ArticleCategory)
                .FirstOrDefaultAsync(a => a.Slug == slug);
            if (article == null) return NotFound();
            return Ok(new {
                article.Id, article.Title, article.Slug, article.Thumbnail, article.Content, article.ArticleCategoryId, CategoryName = article.ArticleCategory.Name
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateArticle(int id, Article article)
        {
            if (id != article.Id) return BadRequest("Lỗi ID không khớp");
            _context.Entry(article).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArticle(int id)
        {
            var article = await _context.Articles.FindAsync(id);
            if (article == null) return NotFound();
            _context.Articles.Remove(article);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{id}/thumbnail")]
        public async Task<IActionResult> UploadThumbnail(int id, IFormFile file)
        {
            var article = await _context.Articles.FindAsync(id);
            if (article == null) return NotFound();
            
            if (file != null && file.Length > 0)
            {
                article.Thumbnail = file.FileName; // Tạm thời lưu tên file để test
                await _context.SaveChangesAsync();
                return Ok(new { message = "Upload ảnh thành công", thumbnail = article.Thumbnail });
            }
            return BadRequest("Mày chưa chọn file ảnh");
        }
    }
}