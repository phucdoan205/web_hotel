using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
   
    public class PermissionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PermissionsController(AppDbContext context)
        {
            _context = context;
        }

    
        public async Task<ActionResult<IEnumerable<Permission>>> GetAll()
        {
            return await _context.Permissions.ToListAsync();
        }

        
        public async Task<ActionResult<Permission>> GetById(int id)
        {
            var permission = await _context.Permissions.FindAsync(id);
            if (permission == null) return NotFound();
            return permission;
        }

        
        public async Task<ActionResult<Permission>> Create(Permission permission)
        {
            _context.Permissions.Add(permission);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = permission.Id }, permission);
        }

        
        public async Task<IActionResult> Update(int id, Permission permission)
        {
            if (id != permission.Id) return BadRequest();

            _context.Entry(permission).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

      
        public async Task<IActionResult> Delete(int id)
        {
            var permission = await _context.Permissions.FindAsync(id);
            if (permission == null) return NotFound();

            _context.Permissions.Remove(permission);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

