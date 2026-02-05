using JoaoDeBarro.BuildingBlocks.DomainObjects;
using JoaoDeBarro.BuildingBlocks.MediatR;
using MediatR;

namespace JoaoDeBarro.Receivables.Infrastructure;

public static class MediatorExtension
{
    public static async Task PublishEventsAsync(this IMediatrHandler mediator, ReceivableContext context)
    {
        var domainEntities = context.ChangeTracker
            .Entries<Entity>()
            .Where(x => x.Entity.Events != null && x.Entity.Events.Any());

        var domainEvents = domainEntities
            .SelectMany(x => x.Entity.Events)
            .ToList();
        
        domainEntities.ToList()
            .ForEach(entity => entity.Entity.ClearEvents());

        var tasks = domainEvents
            .Select(async (domainEvent) =>
            {
                await mediator.PublishEvent(domainEvent);
            });
        
        await Task.WhenAll(tasks);
    }
}