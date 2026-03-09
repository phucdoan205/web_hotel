using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    
    public class MembershipsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MembershipsController(AppDbContext context)
        {
            _context = context;
        }

        
        public async Task<ActionResult<IEnumerable<Membership>>> GetAll()
        {
            return await _context.Memberships.ToListAsync();
        }

       
        public async Task<ActionResult<Membership>> GetById(int id)
        {
            var entity = await _context.Memberships.FindAsync(id);
            if (entity == null) return NotFound();
            return entity;
        }

       
        public async Task<ActionResult<Membership>> Create(Membership membership)
        {
            _context.Memberships.Add(membership);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = membership.Id }, membership);
        }

      
        public async Task<IActionResult> Update(int id, Membership membership)
        {
            if (id != membership.Id) return BadRequest();

            _context.Entry(membership).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

  
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Memberships.FindAsync(id);
            if (entity == null) return NotFound();

            _context.Memberships.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

