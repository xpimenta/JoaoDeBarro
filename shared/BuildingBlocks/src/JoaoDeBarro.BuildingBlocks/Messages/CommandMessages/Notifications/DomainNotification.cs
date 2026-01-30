using JoaoDeBarro.BuildingBlocks.Messages;
using MediatR;

namespace JoaoDeBarro.BuildingBlocks.Messages.CommandMessages.Notifications;

public class DomainNotification : Message, INotification
{
    public Guid DomainNotificationId { get; }
    public DateTime TimeStamp { get;}
    public string Key { get; }
    public string Value { get; }
    public int Version { get;  }

    public DomainNotification(string key, string value)
    {
        Key = key;
        Value = value;
        
        DomainNotificationId = Guid.NewGuid();
        TimeStamp = DateTime.Now;
        Version = 1;
    }
}
