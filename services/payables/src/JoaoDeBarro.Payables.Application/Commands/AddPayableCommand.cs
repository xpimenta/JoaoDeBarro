using FluentValidation;
using JoaoDeBarro.BuildingBlocks.Messages;
using JoaoDeBarro.SharedKernel.Enums;

namespace JoaoDeBarro.Payables.Application.Commands;

public class AddPayableCommand : Command
{
    public string Description { get; }
    public DateOnly DueDate { get; }
    public DateOnly? PaymentDate { get; }
    public PaymentMethod PaymentMethod { get; }
    public string CurrencyCode { get; }
    public decimal PrincipalAmount { get; }
    public decimal InterestAmount { get; }
    public decimal AmountPaid { get; }
    public string Category { get; }
    public string Notes { get; }

    public AddPayableCommand(string description, DateOnly dueDate, DateOnly? paymentDate, PaymentMethod paymentMethod, string currencyCode, decimal principalAmount, decimal interestAmount, decimal amountPaid, string category, string notes)
    {
        Description = description;
        DueDate = dueDate;
        PaymentDate = paymentDate;
        PaymentMethod = paymentMethod;
        CurrencyCode = currencyCode;
        PrincipalAmount = principalAmount;
        InterestAmount = interestAmount;
        AmountPaid = amountPaid;
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
        
        RuleFor(p => p.PrincipalAmount)
            .GreaterThan(0)
            .WithMessage("O campo {PropertyName} precisa ser maior que 0");
        
        RuleFor(p => p.Category)
            .NotEmpty()
            .WithMessage("O campo {PropertyName} precisa ser fornecido");
    }
}
