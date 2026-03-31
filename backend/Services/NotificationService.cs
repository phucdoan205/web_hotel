using backend.Data;
using backend.DTOs.Notification;
using backend.Models;

public class NotificationService
{
    private readonly AppDbContext _context;
    private readonly NotificationRealtimeService _notificationRealtimeService;

    public NotificationService(
        AppDbContext context,
        NotificationRealtimeService notificationRealtimeService)
    {
        _context = context;
        _notificationRealtimeService = notificationRealtimeService;
    }

    public async Task<NotificationResponseDTO> CreateAsync(
        string title,
        string content,
        string? type = "Info",
        string? referenceLink = null,
        int? userId = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = title.Trim(),
            Content = content.Trim(),
            Type = string.IsNullOrWhiteSpace(type) ? "Info" : type.Trim(),
            ReferenceLink = string.IsNullOrWhiteSpace(referenceLink) ? null : referenceLink.Trim(),
            IsRead = false,
            CreatedAt = DateTime.Now
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        var response = Map(notification);
        _notificationRealtimeService.Publish(response);

        return response;
    }

    public static NotificationResponseDTO Map(Notification notification)
    {
        return new NotificationResponseDTO
        {
            Id = notification.Id,
            UserId = notification.UserId,
            Title = notification.Title,
            Content = notification.Content,
            Type = notification.Type,
            ReferenceLink = notification.ReferenceLink,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt
        };
    }
}
