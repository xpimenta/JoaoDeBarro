using JoaoDeBarro.BuildingBlocks.DomainObjects;
using JoaoDeBarro.SharedKernel.Enums;
using JoaoDeBarro.SharedKernel.ValueObjects;

namespace JoaoDeBarro.Payables.Domain;

public class Payable : Entity, IAggregateRoot
{
    public string Description { get; private set; }
    public DateOnly DueDate { get; private set; }
    public DateOnly? PaymentDate { get; private set; }
    public PaymentMethod PaymentMethod { get; private set; }
    public string Category { get; private set; }
    public string Notes { get; private set; }

    private decimal _principalAmount;
    private decimal _interestAmount;
    private decimal _amountPaid;

    // EF Core
    private Payable()
    {
        Description = string.Empty;
        Category = string.Empty;
        Notes = string.Empty;
        CurrencyCode = "BRL";
    }

    public Payable(
        string description,
        DateOnly dueDate,
        DateOnly? paymentDate,
        PaymentMethod paymentMethod,
        string currencyCode,
        string category,
        string notes)
    {
        Description = description?.Trim() ?? string.Empty;
        DueDate = dueDate;
        PaymentDate = paymentDate;
        PaymentMethod = paymentMethod;
        CurrencyCode = string.IsNullOrWhiteSpace(currencyCode) ? "BRL" : currencyCode.Trim().ToUpperInvariant();
        Category = category?.Trim() ?? string.Empty;
        Notes = notes?.Trim() ?? string.Empty;

        Validate();
    }

    public string CurrencyCode { get; private set; }
    public Money PrincipalAmount => Money.Of(_principalAmount, CurrencyCode);
    public Money InterestAmount => Money.Of(_interestAmount, CurrencyCode);
    public Money AmountPaid => Money.Of(_amountPaid, CurrencyCode);
    public Money TotalAmount => PrincipalAmount + InterestAmount;
    public Money OutstandingAmount => TotalAmount - AmountPaid;
    public PayableStatus Status
    {
        get
        {
            if (OutstandingAmount.IsZero) return PayableStatus.Settled;

            var today = DateOnly.FromDateTime(DateTime.Now);
            if (DueDate < today) return PayableStatus.Overdue;
            if (DueDate == today) return PayableStatus.DueToday;

            return PayableStatus.Open;
        }
    }

    private void Validate()
    {
        if (string.IsNullOrWhiteSpace(Description))
            throw new ArgumentException("Description is required.", nameof(Description));

        if (string.IsNullOrWhiteSpace(Category))
            throw new ArgumentException("Category is required.", nameof(Category));

        if (string.IsNullOrWhiteSpace(CurrencyCode))
            throw new ArgumentException("Currency code is required.", nameof(CurrencyCode));
    }

    public void SetAmounts(decimal principalAmount, decimal interestAmount, decimal amountPaid)
    {
        if (principalAmount < 0) throw new ArgumentOutOfRangeException(nameof(principalAmount));
        if (interestAmount < 0) throw new ArgumentOutOfRangeException(nameof(interestAmount));
        if (amountPaid < 0) throw new ArgumentOutOfRangeException(nameof(amountPaid));

        _principalAmount = principalAmount;
        _interestAmount = interestAmount;
        _amountPaid = amountPaid;
    }
}
