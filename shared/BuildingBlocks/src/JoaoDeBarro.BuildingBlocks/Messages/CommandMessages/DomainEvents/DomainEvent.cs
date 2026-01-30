using JoaoDeBarro.BuildingBlocks.Messages;

namespace JoaoDeBarro.BuildingBlocks.Messages.CommandMessages.DomainEvents;

public abstract class DomainEvent : Event
{
    protected DomainEvent(Guid aggregateId)
    {
        AggregateId = aggregateId;
    }
}
