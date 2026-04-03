using System.Collections.Concurrent;
using System.Threading.Channels;
using backend.DTOs.Notification;

public class NotificationRealtimeService
{
    private readonly ConcurrentDictionary<Guid, Channel<NotificationResponseDTO>> _subscribers = new();

    public ChannelReader<NotificationResponseDTO> Subscribe(CancellationToken cancellationToken)
    {
        var channel = Channel.CreateUnbounded<NotificationResponseDTO>();
        var subscriberId = Guid.NewGuid();

        _subscribers[subscriberId] = channel;

        cancellationToken.Register(() =>
        {
            if (_subscribers.TryRemove(subscriberId, out var subscriberChannel))
            {
                subscriberChannel.Writer.TryComplete();
            }
        });

        return channel.Reader;
    }

    public void Publish(NotificationResponseDTO notification)
    {
        foreach (var subscriber in _subscribers.Values)
        {
            subscriber.Writer.TryWrite(notification);
        }
    }
}
