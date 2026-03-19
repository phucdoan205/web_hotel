using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
 
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
                .Include(a => a.Category)
                .Include(a => a.Author)
                .ToListAsync();
            return Ok(articles);
        }
 
        [HttpPost]
        public async Task<IActionResult> CreateArticle(Article article)
        {
            _context.Articles.Add(article);
            await _context.SaveChangesAsync();
            return Ok(article);
        }
    }
}