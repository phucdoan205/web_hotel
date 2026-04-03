using AutoMapper;
using backend.Common;
using backend.Data;
using backend.DTOs.Equipment;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EquipmentController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public EquipmentController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/equipment
        [HttpGet]
        public async Task<ActionResult<PagedResponse<EquipmentDTO>>> GetEquipments(
            [FromQuery] string? category = null,
            [FromQuery] string? search = null,
            [FromQuery] bool? isActive = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15)
        {
            var query = _context.Equipments.AsNoTracking();

            if (!string.IsNullOrEmpty(category))
                query = query.Where(e => e.Category == category);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(e => e.Name.Contains(search) ||
                                       e.ItemCode.Contains(search) ||
                                       (e.Supplier != null && e.Supplier.Contains(search)));

            if (isActive.HasValue)
                query = query.Where(e => e.IsActive == isActive.Value);

            var totalCount = await query.CountAsync();

            var equipments = await query
                .OrderBy(e => e.ItemCode)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = _mapper.Map<List<EquipmentDTO>>(equipments);

            var result = new PagedResponse<EquipmentDTO>(dtos, totalCount, page, pageSize);
            return Ok(result);
        }

        // GET: api/equipment/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<EquipmentDTO>> GetEquipment(int id)
        {
            var equipment = await _context.Equipments
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);

            if (equipment == null)
                return NotFound(new { message = "Không tìm thấy thiết bị" });

            return Ok(_mapper.Map<EquipmentDTO>(equipment));
        }

        // POST: api/equipment
        [HttpPost]
        public async Task<ActionResult<EquipmentDTO>> Create([FromBody] CreateEquipmentDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Kiểm tra ItemCode trùng (business rule không có trong annotation)
            if (await _context.Equipments.AnyAsync(e => e.ItemCode == dto.ItemCode))
            {
                ModelState.AddModelError("ItemCode", $"Mã thiết bị '{dto.ItemCode}' đã tồn tại");
                return BadRequest(ModelState);
            }

            var equipment = _mapper.Map<Equipment>(dto);

            _context.Equipments.Add(equipment);
            await _context.SaveChangesAsync();

            var resultDto = _mapper.Map<EquipmentDTO>(equipment);
            return CreatedAtAction(nameof(GetEquipment), new { id = equipment.Id }, resultDto);
        }

        // PUT: api/equipment/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateEquipmentDTO dto)
        {
            dto.Id = id;

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var equipment = await _context.Equipments.FindAsync(id);
            if (equipment == null)
                return NotFound(new { message = "Không tìm thấy thiết bị" });

            // Kiểm tra ItemCode trùng (trừ bản ghi hiện tại)
            if (!string.IsNullOrEmpty(dto.ItemCode) &&
                await _context.Equipments.AnyAsync(e => e.ItemCode == dto.ItemCode && e.Id != id))
            {
                ModelState.AddModelError("ItemCode", $"Mã thiết bị '{dto.ItemCode}' đã tồn tại");
                return BadRequest(ModelState);
            }

            _mapper.Map(dto, equipment);
            equipment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/equipment/{id} → Soft delete (đổi IsActive = false)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var equipment = await _context.Equipments.FindAsync(id);
            if (equipment == null)
                return NotFound(new { message = "Không tìm thấy thiết bị" });

            equipment.IsActive = false;
            equipment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/equipment/{id}/toggle-active
        [HttpPatch("{id}/toggle-active")]
        public async Task<IActionResult> ToggleActive(int id)
        {
            var equipment = await _context.Equipments.FindAsync(id);
            if (equipment == null)
                return NotFound(new { message = "Không tìm thấy thiết bị" });

            equipment.IsActive = !equipment.IsActive;
            equipment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã thay đổi trạng thái", isActive = equipment.IsActive });
        }
    }
}