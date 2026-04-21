using AutoMapper;
using backend.Common;
using backend.Data;
using backend.DTOs.Audit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/Logs")]
    public class LogsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public LogsController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/Logs  (xem tất cả log + phân trang)
        [HttpGet]
        public async Task<ActionResult<PagedResponse<AuditLogResponseDTO>>> GetAllLogs(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var query = _context.AuditLogs
                .Include(a => a.User)
                    .ThenInclude(u => u.Role)
                .OrderByDescending(a => a.LogDate)
                .AsNoTracking();

            var totalCount = await query.CountAsync();

            var logs = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = _mapper.Map<List<AuditLogResponseDTO>>(logs);

            var result = new PagedResponse<AuditLogResponseDTO>(dtos, totalCount, page, pageSize);
            return Ok(result);
        }

        // GET: api/Logs/user/5  (xem log theo UserId)
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<PagedResponse<AuditLogResponseDTO>>> GetLogsByUserId(
            int userId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var query = _context.AuditLogs
                .Include(a => a.User)
                    .ThenInclude(u => u.Role)
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.LogDate)
                .AsNoTracking();

            var totalCount = await query.CountAsync();

            var logs = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = _mapper.Map<List<AuditLogResponseDTO>>(logs);

            var result = new PagedResponse<AuditLogResponseDTO>(dtos, totalCount, page, pageSize);
            return Ok(result);
        }
    }
}
