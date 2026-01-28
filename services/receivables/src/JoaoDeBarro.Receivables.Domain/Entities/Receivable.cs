using JoaoDeBarro.BuildingBlocks.DomainObjects;
using JoaoDeBarro.SharedKernel.Enums;
using JoaoDeBarro.SharedKernel.ValueObjects;

namespace JoaoDeBarro.Receivables.Domain;

public class Receivable :  Entity,  IAggregateRoot
{
    public string CustomerName { get; private set; }
    public string ServiceDescription { get; private set; }
    public DateOnly ServiceDate { get; private set; }

    public string? ServiceOrderNumber { get; private set; }
    public string? InvoiceNumber { get; private set; }
    public DateOnly? InvoiceIssueDate { get; private set; }

    public DateOnly DueDate { get; private set; }
    public PaymentMethod PaymentMethod { get; private set; }
    
    public string CurrencyCode { get; private set; } = "BRL";
    
    private decimal _amountReceived;
    private decimal _issAmount;
    private decimal _grossAmount;
    
    public Money GrossAmount => Money.Of(_grossAmount, CurrencyCode);
    public Money IssAmount => Money.Of(_issAmount, CurrencyCode);
    public Money AmountReceived => Money.Of(_amountReceived, CurrencyCode);
    public Money NetAmount => GrossAmount - IssAmount;
    public Money OutstandingAmount => NetAmount - AmountReceived;

    public ReceivableStatus Status
    {
        get
        {
            if (OutstandingAmount.IsZero) return ReceivableStatus.Settled;

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            if (DueDate < today) return ReceivableStatus.Overdue;
            if (DueDate == today) return ReceivableStatus.DueToday;

            return ReceivableStatus.Open;
        }
    }

    // EF Core
    private Receivable() {}

    public Receivable(
        string customerName,
        string serviceDescription,
        DateOnly serviceDate,
        DateOnly dueDate,
        PaymentMethod paymentMethod,
        Money grossAmount,
        Money issAmount)
    {
        CustomerName = customerName?.Trim() ?? string.Empty;
        ServiceDescription = serviceDescription?.Trim() ?? string.Empty;
        ServiceDate = serviceDate;
        DueDate = dueDate;
        PaymentMethod = paymentMethod;

        CurrencyCode = grossAmount.Currency;
        _grossAmount = grossAmount.Amount;
        _issAmount = issAmount.Amount;
        _amountReceived = 0m;

        Validate();
    }

    // -------------------------
    // Validation (Domain Invariants)
    // -------------------------
    private void Validate()
    {
        AssertionConcern.AssertNotEmpty(CustomerName, "Customer name is required.");
        AssertionConcern.AssertNotEmpty(ServiceDescription, "Service description is required.");

        AssertionConcern.AssertNotNull(GrossAmount, "Gross amount is required.");
        AssertionConcern.AssertNotNull(IssAmount, "ISS amount is required.");

        AssertionConcern.AssertTrue(GrossAmount.Amount >= 0, "Gross amount must be >= 0.");
        AssertionConcern.AssertTrue(IssAmount.Amount >= 0, "ISS amount must be >= 0.");
        AssertionConcern.AssertTrue(
            IssAmount.Amount <= GrossAmount.Amount,
            "ISS amount cannot exceed gross amount."
        );

        AssertionConcern.AssertTrue(
            GrossAmount.Currency == IssAmount.Currency,
            "Gross amount and ISS amount must have the same currency."
        );
    }

    // -------------------------
    // Behavior
    // -------------------------

    public void SetInvoice(string invoiceNumber, DateOnly issueDate)
    {
        AssertionConcern.AssertNotEmpty(invoiceNumber, "Invoice number is required.");

        InvoiceNumber = invoiceNumber.Trim();
        InvoiceIssueDate = issueDate;
    }

    public void SetServiceOrder(string serviceOrderNumber)
    {
        AssertionConcern.AssertNotEmpty(serviceOrderNumber, "Service order number is required.");
        ServiceOrderNumber = serviceOrderNumber.Trim();
    }

    public void RegisterReceipt(Money receivedAmount)
    {
        AssertionConcern.AssertNotNull(receivedAmount, "Received amount is required.");
        AssertionConcern.AssertTrue(receivedAmount.Currency == GrossAmount.Currency, "Currency mismatch.");
        AssertionConcern.AssertTrue(receivedAmount.Amount > 0, "Received amount must be > 0.");
        AssertionConcern.AssertTrue(
            receivedAmount.Amount <= OutstandingAmount.Amount,
            "Received amount cannot exceed outstanding amount."
        );

        _amountReceived = _amountReceived + receivedAmount.Amount;
    }

    public void ChangeDueDate(DateOnly dueDate)
    {
        DueDate = dueDate;
    }

    public void ChangePaymentMethod(PaymentMethod paymentMethod)
    {
        PaymentMethod = paymentMethod;
    }
}
