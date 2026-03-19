using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderServiceDetailsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrderServiceDetailsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderServiceDetail>>> GetAll()
        {
            return await _context.OrderServiceDetails.ToListAsync();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderServiceDetail>> GetById(int id)
        {
            var entity = await _context.OrderServiceDetails.FindAsync(id);
            if (entity == null) return NotFound();
            return entity;
        }

        [HttpPost]
        public async Task<ActionResult<OrderServiceDetail>> Create(OrderServiceDetail detail)
        {
            _context.OrderServiceDetails.Add(detail);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = detail.Id }, detail);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, OrderServiceDetail detail)
        {
            if (id != detail.Id) return BadRequest();

            _context.Entry(detail).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.OrderServiceDetails.FindAsync(id);
            if (entity == null) return NotFound();

            _context.OrderServiceDetails.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

