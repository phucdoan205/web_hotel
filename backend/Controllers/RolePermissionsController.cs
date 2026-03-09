using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
  
    public class RolePermissionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RolePermissionsController(AppDbContext context)
        {
            _context = context;
        }

 
        public async Task<ActionResult<IEnumerable<RolePermission>>> GetAll()
        {
            return await _context.RolePermissions.ToListAsync();
        }

   
        public async Task<ActionResult<RolePermission>> GetById(int roleId, int permissionId)
        {
            var entity = await _context.RolePermissions
                .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

            if (entity == null) return NotFound();
            return entity;
        }

        public async Task<ActionResult<RolePermission>> Create(RolePermission rolePermission)
        {
            _context.RolePermissions.Add(rolePermission);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { roleId = rolePermission.RoleId, permissionId = rolePermission.PermissionId }, rolePermission);
        }

       
        public async Task<IActionResult> Delete(int roleId, int permissionId)
        {
            var entity = await _context.RolePermissions
                .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

            if (entity == null) return NotFound();

            _context.RolePermissions.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

