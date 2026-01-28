using JoaoDeBarro.BuildingBlocks.DomainObjects;
using JoaoDeBarro.SharedKernel.Enums;
using JoaoDeBarro.SharedKernel.ValueObjects;

namespace JoaoDeBarroPayables.Domain;

public class Payable : Entity, IAggregateRoot
{
    public string Description { get; }
    public string CurrencyCode { get; }
    public DateOnly DueDate { get; }
    public DateOnly? PaymentDate { get; }
    public PaymentMethod PaymentMethod { get; }

    private decimal _principalAmountValue;
    private decimal _interestAmoutValue;
    private decimal _amountPaidValue;
    
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

    public string Category { get; }
    public string Notes { get; }
    
}
