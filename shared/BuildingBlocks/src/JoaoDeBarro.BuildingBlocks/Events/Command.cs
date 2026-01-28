using FluentValidation.Results;
using MediatR;

namespace JoaoDeBarro.BuildingBlocks.Events;

public abstract class Command : Message, IRequest<bool>
{
    public DateTime TimeStamp { get; set; }
    public ValidationResult ValidationResult { get; set; }
    
    protected Command()
    {
        TimeStamp = DateTime.Now;
    }
    
    public virtual bool IsValid() => throw new NotImplementedException();
}