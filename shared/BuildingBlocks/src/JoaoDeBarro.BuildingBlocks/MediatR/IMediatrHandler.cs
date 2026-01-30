using JoaoDeBarro.BuildingBlocks.Messages;

namespace JoaoDeBarro.BuildingBlocks.MediatR;

public interface IMediatrHandler
{
    Task PublishEvent<T>(T eventToSend) where T : Event;
    Task<bool> SendCommand<T>(T command) where T : Command;
}
