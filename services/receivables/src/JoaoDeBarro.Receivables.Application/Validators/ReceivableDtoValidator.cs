using FluentValidation;
using JoaoDeBarro.Receivables.Application.DTOs;
using JoaoDeBarro.SharedKernel.Enums;

namespace JoaoDeBarro.Receivables.Application.Validators;

public class ReceivableDtoValidator : AbstractValidator<ReceivableDto>
{
    public ReceivableDtoValidator()
    {
        RuleFor(x => x.CustomerName)
            .NotEmpty()
            .MaximumLength(150);

        RuleFor(x => x.ServiceDescription)
            .NotEmpty()
            .MaximumLength(255);

        RuleFor(x => x.ServiceDate)
            .NotEmpty();

        RuleFor(x => x.DueDate)
            .NotEmpty();

        RuleFor(x => x.PaymentMethod)
            .NotEmpty()
            .Must(BeValidPaymentMethod)
            .WithMessage("Payment method is invalid.");

        RuleFor(x => x.CurrencyCode)
            .NotEmpty()
            .Length(3);

        RuleFor(x => x.GrossAmount)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.IssAmount)
            .GreaterThanOrEqualTo(0)
            .LessThanOrEqualTo(x => x.GrossAmount - x.InssAmount);

        RuleFor(x => x.InssAmount)
            .GreaterThanOrEqualTo(0)
            .LessThanOrEqualTo(x => x.GrossAmount - x.IssAmount);

        RuleFor(x => x.AmountReceived)
            .GreaterThanOrEqualTo(0)
            .LessThanOrEqualTo(x => x.GrossAmount - x.IssAmount - x.InssAmount);

        RuleFor(x => x.PaymentDate)
            .NotNull()
            .When(x => x.AmountReceived > 0)
            .WithMessage("Payment date is required when amount received is informed.");

        RuleFor(x => x.PaymentDate)
            .Null()
            .When(x => x.AmountReceived <= 0)
            .WithMessage("Payment date must be null when there is no payment.");

        RuleFor(x => x.InvoiceNumber)
            .NotEmpty()
            .When(x => x.InvoiceIssueDate.HasValue);

        RuleFor(x => x.InvoiceIssueDate)
            .NotEmpty()
            .When(x => !string.IsNullOrWhiteSpace(x.InvoiceNumber));
    }

    private static bool BeValidPaymentMethod(string value)
    {
        return Enum.TryParse<PaymentMethod>(value, ignoreCase: true, out _);
    }
}
