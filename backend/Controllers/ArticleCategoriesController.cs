using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    
    public class ArticleCategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ArticleCategoriesController(AppDbContext context)
        {
            _context = context;
        }

 
        public async Task<ActionResult<IEnumerable<ArticleCategory>>> GetAll()
        {
            return await _context.ArticleCategories.ToListAsync();
        }

 
        public async Task<ActionResult<ArticleCategory>> GetById(int id)
        {
            var entity = await _context.ArticleCategories.FindAsync(id);
            if (entity == null) return NotFound();
            return entity;
        }

       
        public async Task<ActionResult<ArticleCategory>> Create(ArticleCategory category)
        {
            _context.ArticleCategories.Add(category);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
        }

        
        public async Task<IActionResult> Update(int id, ArticleCategory category)
        {
            if (id != category.Id) return BadRequest();

            _context.Entry(category).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

       
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.ArticleCategories.FindAsync(id);
            if (entity == null) return NotFound();

            _context.ArticleCategories.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

