using MediatR;

namespace JoaoDeBarro.BuildingBlocks.Messages.CommandMessages.Notifications;

public class DomainNotificationHandler : INotificationHandler<DomainNotification> 
{
    private readonly List<DomainNotification> _notifications = new();

    public Task Handle(DomainNotification notification, CancellationToken cancellationToken)
    {
        _notifications.Add(notification);
        return Task.CompletedTask;
    }
    
    public virtual List<DomainNotification> Notifications { get => _notifications; }
    
    public virtual bool HasNotifications() => _notifications.Count > 0;
    
    public void Dispose()
    {
        _notifications.Clear();
    }
}
