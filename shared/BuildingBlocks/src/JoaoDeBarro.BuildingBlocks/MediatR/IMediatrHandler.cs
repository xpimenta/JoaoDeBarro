using JoaoDeBarro.BuildingBlocks.Messages;
using JoaoDeBarro.BuildingBlocks.Messages.CommandMessages.Notifications;

namespace JoaoDeBarro.BuildingBlocks.MediatR;

public interface IMediatrHandler
{
    Task PublishEvent<T>(T eventToSend) where T : Event;
    Task<bool> SendCommand<T>(T command) where T : Command;
    Task PublishNotification<T>(T notification) where T : DomainNotification;
}
