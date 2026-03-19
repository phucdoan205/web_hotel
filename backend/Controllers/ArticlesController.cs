using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
   
    public class ArticlesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ArticlesController(AppDbContext context)
        {
            _context = context;
        }

       
        public async Task<ActionResult<IEnumerable<Article>>> GetAll()
        {
            return await _context.Articles.ToListAsync();
        }

        
        public async Task<ActionResult<Article>> GetById(int id)
        {
            var entity = await _context.Articles.FindAsync(id);
            if (entity == null) return NotFound();
            return entity;
        }

       
        public async Task<ActionResult<Article>> Create(Article article)
        {
            _context.Articles.Add(article);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = article.Id }, article);
        }

        
        public async Task<IActionResult> Update(int id, Article article)
        {
            if (id != article.Id) return BadRequest();

            _context.Entry(article).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Articles.FindAsync(id);
            if (entity == null) return NotFound();

            _context.Articles.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

