using backend.Data;
using backend.DTOs;
using backend.DTOs.Article;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
            var articles = await _context.Articles
                .Select(a => new ArticleDTO
                {
                    Id = a.Id,
                    CategoryId = a.CategoryId,
                    AuthorId = a.AuthorId,
                    Title = a.Title,
                    Slug = a.Slug,
                    Content = a.Content,
                    ThumbnailUrl = a.ThumbnailUrl,
                    PublishedAt = a.PublishedAt,
                    Status = a.Status
                })
                .AsNoTracking()
                .ToListAsync();

            return Ok(articles);
        }

        [HttpPost]
        public async Task<IActionResult> CreateArticle([FromBody] CreateArticleDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return BadRequest("Title is required.");
            }

            var article = new Article
            {
                CategoryId = request.CategoryId,
                AuthorId = request.AuthorId,
                Title = request.Title.Trim(),
                Slug = string.IsNullOrWhiteSpace(request.Slug) ? null : request.Slug.Trim(),
                Content = request.Content,
                ThumbnailUrl = string.IsNullOrWhiteSpace(request.ThumbnailUrl) ? null : request.ThumbnailUrl.Trim(),
                PublishedAt = request.PublishedAt,
                Status = request.Status
            };

            _context.Articles.Add(article);
            await _context.SaveChangesAsync();

            return Ok(new ArticleDTO
            {
                Id = article.Id,
                CategoryId = article.CategoryId,
                AuthorId = article.AuthorId,
                Title = article.Title,
                Slug = article.Slug,
                Content = article.Content,
                ThumbnailUrl = article.ThumbnailUrl,
                PublishedAt = article.PublishedAt,
                Status = article.Status
            });
        }
    }
}
