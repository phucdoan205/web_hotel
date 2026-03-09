using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
  
    public class AuditLogsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuditLogsController(AppDbContext context)
        {
            _context = context;
        }

        
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetAll()
        {
            return await _context.AuditLogs.ToListAsync();
        }

     
        public async Task<ActionResult<AuditLog>> GetById(int id)
        {
            var entity = await _context.AuditLogs.FindAsync(id);
            if (entity == null) return NotFound();
            return entity;
        }

 
        public async Task<ActionResult<AuditLog>> Create(AuditLog auditLog)
        {
            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = auditLog.Id }, auditLog);
        }

        public async Task<IActionResult> Update(int id, AuditLog auditLog)
        {
            if (id != auditLog.Id) return BadRequest();

            _context.Entry(auditLog).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.AuditLogs.FindAsync(id);
            if (entity == null) return NotFound();

            _context.AuditLogs.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

