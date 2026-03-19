using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiceCategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ServiceCategoriesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServiceCategory>>> GetAll()
        {
            return await _context.ServiceCategories.ToListAsync();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ServiceCategory>> GetById(int id)
        {
            var entity = await _context.ServiceCategories.FindAsync(id);
            if (entity == null) return NotFound();
            return entity;
        }

        [HttpPost]
        public async Task<ActionResult<ServiceCategory>> Create(ServiceCategory category)
        {
            _context.ServiceCategories.Add(category);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, ServiceCategory category)
        {
            if (id != category.Id) return BadRequest();

            _context.Entry(category).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.ServiceCategories.FindAsync(id);
            if (entity == null) return NotFound();

            _context.ServiceCategories.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

