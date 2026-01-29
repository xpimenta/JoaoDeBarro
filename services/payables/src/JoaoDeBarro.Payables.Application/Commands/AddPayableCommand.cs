using FluentValidation;
using JoaoDeBarro.BuildingBlocks.Events;
using JoaoDeBarro.SharedKernel.Enums;

namespace JoaoDeBarro.Payables.Application.Commands;

public class AddPayableCommand : Command
{
    public string Description { get; }
    public DateOnly DueDate { get; }
    public DateOnly? PaymentDate { get; }
    public PaymentMethod PaymentMethod { get; }
    public decimal _principalAmountValue { get; }
    public decimal _interestAmoutValue{ get; }
    public decimal _amountPaidValue{ get; }
    public string Category { get; }
    public string Notes { get; }

    public AddPayableCommand(string description, DateOnly dueDate, DateOnly? paymentDate, PaymentMethod paymentMethod, decimal principalAmountValue, decimal interestAmoutValue, decimal amountPaidValue, string category, string notes)
    {
        Description = description;
        DueDate = dueDate;
        PaymentDate = paymentDate;
        PaymentMethod = paymentMethod;
        _principalAmountValue = principalAmountValue;
        _interestAmoutValue = interestAmoutValue;
        _amountPaidValue = amountPaidValue;
        Category = category;
        Notes = notes;
    }

    public override bool IsValid()
    {
        ValidationResult = new AddPayableValidation().Validate(this);
        return ValidationResult.IsValid;
    }
}

public class AddPayableValidation : AbstractValidator<AddPayableCommand>
{
    public AddPayableValidation()
    {
        RuleFor(p => p.Description)
            .NotEmpty()
            .WithMessage("O campo {PropertyName} precisa ser fornecido");
        
        RuleFor(p => p.DueDate)
            .NotNull()
            .WithMessage("O campo {PropertyName} precisa ser fornecido");
        
        RuleFor(p => p._principalAmountValue)
            .GreaterThan(0)
            .WithMessage("O campo {PropertyName} precisa ser maior que 0");
        
        RuleFor(p => p.Category)
            .NotEmpty()
            .WithMessage("O campo {PropertyName} precisa ser fornecido");
    }
}