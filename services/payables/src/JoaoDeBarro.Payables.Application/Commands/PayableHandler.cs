using JoaoDeBarro.BuildingBlocks.Events;
using MediatR;

namespace JoaoDeBarro.Payables.Application.Commands;

public class PayableHandler : IRequestHandler<AddPayableCommand, bool>
{
    public async Task<bool> Handle(AddPayableCommand request, CancellationToken cancellationToken)
    {
        if (!IsValidCommand(request)) return false;

        //logic
        
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