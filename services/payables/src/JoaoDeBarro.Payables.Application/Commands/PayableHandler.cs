using JoaoDeBarro.BuildingBlocks.Messages;
using JoaoDeBarro.Payables.Domain;
using MediatR;

namespace JoaoDeBarro.Payables.Application.Commands;

public class PayableHandler(IPayableRepository payableRepository) : IRequestHandler<AddPayableCommand, bool>
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
        payableRepository.AddPayable(payable);
        await payableRepository.UnitOfWork.CommitAsync();
        return true;
    }



    private bool IsValidCommand(Command command)
    {
        if (command.IsValid()) return true;

        foreach (var error in command.ValidationResult.Errors)
        {
         //event   
        }

        return false;
    }
}
