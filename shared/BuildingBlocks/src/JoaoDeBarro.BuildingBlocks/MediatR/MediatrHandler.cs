using JoaoDeBarro.BuildingBlocks.Events;
using MediatR;

namespace JoaoDeBarro.BuildingBlocks.MediatR;

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
}
