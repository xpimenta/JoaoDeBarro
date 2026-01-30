using JoaoDeBarro.BuildingBlocks.Messages.CommandMessages.DomainEvents;

namespace JoaoDeBarro.Receivables.Domain.Events;

public class UpdateReceivablesEvent : DomainEvent
{
    public UpdateReceivablesEvent(Guid aggregateId) : base(aggregateId)
    {
        
    }
}
