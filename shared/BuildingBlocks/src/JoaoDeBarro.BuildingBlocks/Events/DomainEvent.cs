namespace JoaoDeBarro.BuildingBlocks.Events;

public abstract class DomainEvent : Event
{
    protected DomainEvent(Guid aggregateId)
    {
        AggregateId = aggregateId;
    }
}
