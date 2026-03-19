using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VouchersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VouchersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Voucher>>> GetAll()
        {
            return await _context.Vouchers.ToListAsync();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Voucher>> GetById(int id)
        {
            var entity = await _context.Vouchers.FindAsync(id);
            if (entity == null) return NotFound();
            return entity;
        }

        [HttpPost]
        public async Task<ActionResult<Voucher>> Create(Voucher voucher)
        {
            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = voucher.Id }, voucher);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, Voucher voucher)
        {
            if (id != voucher.Id) return BadRequest();

            _context.Entry(voucher).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Vouchers.FindAsync(id);
            if (entity == null) return NotFound();

            _context.Vouchers.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

