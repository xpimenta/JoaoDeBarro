using JoaoDeBarro.BuildingBlocks.Events;

namespace JoaoDeBarro.BuildingBlocks.MediatR;

public class MediatrHandler : IMediatrHandler
{
    private readonly IMediatrHandler _mediatrHandler;

    public MediatrHandler(IMediatrHandler mediatrHandler)
    {
        _mediatrHandler = mediatrHandler;
    }

    public async Task PublishEvent<T>(T eventToSend) where T : Event
    {
        await _mediatrHandler.PublishEvent(eventToSend);
    }
}