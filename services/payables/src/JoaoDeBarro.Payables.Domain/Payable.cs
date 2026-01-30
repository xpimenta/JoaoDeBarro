using JoaoDeBarro.BuildingBlocks.DomainObjects;
using JoaoDeBarro.SharedKernel.Enums;
using JoaoDeBarro.SharedKernel.ValueObjects;

namespace JoaoDeBarro.Payables.Domain;

public class Payable : Entity, IAggregateRoot
{
    public string Description { get; }
    public DateOnly DueDate { get; }
    public DateOnly? PaymentDate { get; }
    public PaymentMethod PaymentMethod { get; }
    public string Category { get; }
    public string Notes { get; }

    private decimal _principalAmountValue;
    private decimal _interestAmoutValue;
    private decimal _amountPaidValue;

    public Payable(string description, DateOnly dueDate, DateOnly? paymentDate, PaymentMethod paymentMethod, string currencyCode, string category, string notes)
    {
        Description = description;
        DueDate = dueDate;
        PaymentDate = paymentDate;
        PaymentMethod = paymentMethod;
        CurrencyCode = currencyCode;
        Category = category;
        Notes = notes;
        
        
    }

    public string CurrencyCode { get; } = "BRL";
    public Money PrincipalAmount => Money.Of(_principalAmountValue, CurrencyCode);
    public Money InterestAmount => Money.Of(_interestAmoutValue, CurrencyCode);
    public Money AmoutPaid => Money.Of(_amountPaidValue, CurrencyCode);
    public Money TotalAmount => PrincipalAmount +  InterestAmount;
    public Money OutstandingAmount => TotalAmount - AmoutPaid;
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
    
}
