using System.Text.Json;
using backend.Data;
using backend.DTOs.Notification;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http.Features;

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

        private int? ResolveUserId(int? userId)
        {
            if (userId.HasValue)
            {
                return userId.Value;
            }

            if (Request.Headers.TryGetValue("X-User-Id", out var header) &&
                int.TryParse(header.ToString(), out var parsed))
            {
                return parsed;
            }

            return null;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotificationResponseDTO>>> GetLatest(
            [FromQuery] int take = 10,
            [FromQuery] int? userId = null)
        {
            var safeTake = Math.Clamp(take, 1, 50);
            var resolvedUserId = ResolveUserId(userId);

            var query = _context.Notifications
                .AsNoTracking()
                .AsQueryable();

            if (resolvedUserId.HasValue)
            {
                query = query.Where(n => n.UserId == null || n.UserId == resolvedUserId.Value);
            }
            else
            {
                query = query.Where(n => n.UserId == null);
            }

            var notifications = await query
                .OrderByDescending(n => n.CreatedAt)
                .ThenByDescending(n => n.Id)
                .Take(safeTake)
                .ToListAsync();

            return Ok(notifications.Select(NotificationService.Map));
        }

        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllRead([FromQuery] int? userId = null)
        {
            var resolvedUserId = ResolveUserId(userId);

            var query = _context.Notifications
                .AsQueryable();

            if (resolvedUserId.HasValue)
            {
                query = query.Where(n => n.UserId == null || n.UserId == resolvedUserId.Value);
            }
            else
            {
                query = query.Where(n => n.UserId == null);
            }

            var notifications = await query
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
        public async Task Stream([FromQuery] int? userId, CancellationToken cancellationToken)
        {
            var resolvedUserId = ResolveUserId(userId);
            Response.Headers.Append("Cache-Control", "no-cache");
            Response.Headers.Append("Connection", "keep-alive");
            Response.Headers.Append("X-Accel-Buffering", "no");
            Response.ContentType = "text/event-stream";
            HttpContext.Features.Get<IHttpResponseBodyFeature>()?.DisableBuffering();
            await Response.StartAsync(cancellationToken);

            await Response.WriteAsync(": connected\n\n", cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);

            var reader = _notificationRealtimeService.Subscribe(cancellationToken);

            while (!cancellationToken.IsCancellationRequested)
            {
                var hasNotification = await reader.WaitToReadAsync(cancellationToken);
                if (!hasNotification)
                {
                    break;
                }

                while (reader.TryRead(out var notification))
                {
                    if (notification.UserId.HasValue &&
                        (!resolvedUserId.HasValue || notification.UserId.Value != resolvedUserId.Value))
                    {
                        continue;
                    }

                    var payload = JsonSerializer.Serialize(notification);
                    await Response.WriteAsync($"event: notification\n", cancellationToken);
                    await Response.WriteAsync($"data: {payload}\n\n", cancellationToken);
                    await Response.Body.FlushAsync(cancellationToken);
                }

                await Response.WriteAsync(": heartbeat\n\n", cancellationToken);
                await Response.Body.FlushAsync(cancellationToken);
            }
        }
    }
}
