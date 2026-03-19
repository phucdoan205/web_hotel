using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderServicesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrderServicesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderService>>> GetAll()
        {
            return await _context.OrderServices.ToListAsync();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderService>> GetById(int id)
        {
            var entity = await _context.OrderServices.FindAsync(id);
            if (entity == null) return NotFound();
            return entity;
        }

        [HttpPost]
        public async Task<ActionResult<OrderService>> Create(OrderService orderService)
        {
            _context.OrderServices.Add(orderService);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = orderService.Id }, orderService);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, OrderService orderService)
        {
            if (id != orderService.Id) return BadRequest();

            _context.Entry(orderService).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.OrderServices.FindAsync(id);
            if (entity == null) return NotFound();

            _context.OrderServices.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

