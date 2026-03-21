using AutoMapper;
using backend.Common;
using backend.Data;
using backend.DTOs.Attraction;
using backend.Models;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttractionsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        //private readonly IValidator<CreateAttractionDTO> _createValidator;
        //private readonly IValidator<UpdateAttractionDTO> _updateValidator;

        public AttractionsController(
            AppDbContext context,
            IMapper mapper
            //IValidator<CreateAttractionDTO> createValidator,
            //IValidator<UpdateAttractionDTO> updateValidator
            )
        {
            _context = context;
            _mapper = mapper;
            //_createValidator = createValidator;
            //_updateValidator = updateValidator;
        }

        // GET: api/Attractions
        [HttpGet]
        public async Task<ActionResult<PagedResult<AttractionDTO>>> GetAttractions(
            [FromQuery] bool? activeOnly = true,
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15)
        {
            var query = _context.Attractions.AsNoTracking();

            if (activeOnly == true)
            {
                query = query.Where(a => a.IsActive);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(a => a.Name.Contains(search.Trim()));
            }

            var totalCount = await query.CountAsync();

            var attractions = await query
                .OrderBy(a => a.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = _mapper.Map<List<AttractionDTO>>(attractions);

            return Ok(new PagedResponse<AttractionDTO>(dtos, totalCount, page, pageSize));
        }

        // GET: api/attractions/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<AttractionDTO>> GetAttraction(int id)
        {
            var attraction = await _context.Attractions
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == id);

            if (attraction == null)
                return NotFound();

            return Ok(_mapper.Map<AttractionDTO>(attraction));
        }

        // POST: api/Attractions
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAttractionDTO dto)
        {
            //var validation = await _createValidator.ValidateAsync(dto);
            //if (!validation.IsValid) return BadRequest(validation.Errors);

            var entity = _mapper.Map<Attraction>(dto);

            _context.Attractions.Add(entity);
            await _context.SaveChangesAsync();

            var result = _mapper.Map<AttractionDTO>(entity);
            return CreatedAtAction(nameof(GetAttraction), new { id = entity.Id }, result);
        }

        // PUT: api/Attractions/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAttractionDTO dto)
        {
            var attraction = await _context.Attractions.FindAsync(id);
            if (attraction == null)
                return NotFound();

            //var validationContext = new ValidationContext<UpdateAttractionDTO>(dto);
            //validationContext.RootContextData["AttractionId"] = id;
            //var validation = await _updateValidator.ValidateAsync(validationContext);

            //if (!validation.IsValid)
            //    return BadRequest(validation.Errors);

            _mapper.Map(dto, attraction);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/attractions/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var attraction = await _context.Attractions.FindAsync(id);
            if (attraction == null)
                return NotFound();

            _context.Attractions.Remove(attraction);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
