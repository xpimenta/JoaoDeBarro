using JoaoDeBarro.BuildingBlocks.MediatR;
using JoaoDeBarro.BuildingBlocks.Messages;
using JoaoDeBarro.BuildingBlocks.Messages.CommandMessages.Notifications;
using JoaoDeBarro.Payables.Domain;
using MediatR;

namespace JoaoDeBarro.Payables.Application.Commands;

public class PayableCommandHandler(IPayableRepository payableRepository, IMediatrHandler mediatrHandler) : IRequestHandler<AddPayableCommand, bool>
{
    public async Task<bool> Handle(AddPayableCommand request, CancellationToken cancellationToken)
    {
        if (!IsValidCommand(request)) return false;

        Payable payable = 
            new Payable(
                request.Description,
                request.DueDate,
                request.PaymentDate,
                request.PaymentMethod,
                request.CurrencyCode,
                request.Category,
                request.Notes
            );
        payable.SetAmounts(request.PrincipalAmount, request.InterestAmount, request.AmountPaid);
        payableRepository.AddPayable(payable);
        await payableRepository.UnitOfWork.CommitAsync();
        return true;
    }



    private bool IsValidCommand(Command command)
    {
        if (command.IsValid()) return true;
        foreach (var error in command.ValidationResult.Errors)
        {
            mediatrHandler.PublishNotification(new DomainNotification(this.GetType().Name, error.ErrorMessage));
        }
        return false;
    }
}
