using JoaoDeBarro.BuildingBlocks.Messages;
using MediatR;

namespace JoaoDeBarro.BuildingBlocks.MediatR;

/// <summary>
/// Encapsule MediatR for consistency ex: where T : Event
/// </summary>
public class MediatrHandler : IMediatrHandler
{
    private readonly IMediator _mediator;

    public MediatrHandler(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task PublishEvent<T>(T eventToSend) where T : Event
    {
        await _mediator.Publish(eventToSend);
    }

    public async Task<bool> SendCommand<T>(T command) where T : Command
    {
        return await _mediator.Send(command);
    }
}
