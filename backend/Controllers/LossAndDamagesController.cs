using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LossAndDamagesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LossAndDamagesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LossAndDamage>>> GetAll()
        {
            return await _context.LossAndDamages.ToListAsync();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<LossAndDamage>> GetById(int id)
        {
            var entity = await _context.LossAndDamages.FindAsync(id);
            if (entity == null) return NotFound();
            return entity;
        }

        [HttpPost]
        public async Task<ActionResult<LossAndDamage>> Create(LossAndDamage lossAndDamage)
        {
            _context.LossAndDamages.Add(lossAndDamage);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = lossAndDamage.Id }, lossAndDamage);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, LossAndDamage lossAndDamage)
        {
            if (id != lossAndDamage.Id) return BadRequest();

            _context.Entry(lossAndDamage).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.LossAndDamages.FindAsync(id);
            if (entity == null) return NotFound();

            _context.LossAndDamages.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

