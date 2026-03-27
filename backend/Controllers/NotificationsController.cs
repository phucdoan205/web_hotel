using System.Text.Json;
using backend.Data;
using backend.DTOs.Notification;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Tags("Notifications")]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly NotificationRealtimeService _notificationRealtimeService;

        public NotificationsController(
            AppDbContext context,
            NotificationRealtimeService notificationRealtimeService)
        {
            _context = context;
            _notificationRealtimeService = notificationRealtimeService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotificationResponseDTO>>> GetLatest([FromQuery] int take = 10)
        {
            var safeTake = Math.Clamp(take, 1, 50);

            var notifications = await _context.Notifications
                .AsNoTracking()
                .OrderByDescending(n => n.CreatedAt)
                .ThenByDescending(n => n.Id)
                .Take(safeTake)
                .ToListAsync();

            return Ok(notifications.Select(NotificationService.Map));
        }

        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllRead()
        {
            var notifications = await _context.Notifications
                .Where(n => !n.IsRead)
                .ToListAsync();

            if (notifications.Count == 0)
            {
                return NoContent();
            }

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("stream")]
        public async Task Stream(CancellationToken cancellationToken)
        {
            Response.Headers.Append("Cache-Control", "no-cache");
            Response.Headers.Append("Connection", "keep-alive");
            Response.Headers.Append("X-Accel-Buffering", "no");
            Response.ContentType = "text/event-stream";

            var reader = _notificationRealtimeService.Subscribe(cancellationToken);

            await foreach (var notification in reader.ReadAllAsync(cancellationToken))
            {
                var payload = JsonSerializer.Serialize(notification);
                await Response.WriteAsync($"data: {payload}\n\n", cancellationToken);
                await Response.Body.FlushAsync(cancellationToken);
            }
        }
    }
}
