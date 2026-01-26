using JoaoDeBarro.Receivables.Domain.Interfaces;
using MediatR;

namespace JoaoDeBarro.Receivables.Domain.Events.Handlers;

public class UpdateReceivableEventHandler(IReceivableRepository repository)
    : INotificationHandler<UpdateReceivablesEvent>
{
    public async Task Handle(UpdateReceivablesEvent notification, CancellationToken cancellationToken)
    {
        var receivable = await repository.GetReceivableAsync(notification.AggregateId);
        Console.WriteLine($"The receivable with id {receivable?.Id} has been updated.");
    }
}