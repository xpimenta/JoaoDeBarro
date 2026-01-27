using JoaoDeBarro.BuildingBlocks.Events;

namespace JoaoDeBarro.BuildingBlocks.MediatR;

public interface IMediatrHandler
{
    Task PublishEvent<T>(T eventToSend) where T : Event;
}