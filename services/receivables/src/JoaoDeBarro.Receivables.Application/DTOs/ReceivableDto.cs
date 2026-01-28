using JoaoDeBarro.Receivables.Domain;

namespace JoaoDeBarro.Receivables.Application.DTOs;

public class ReceivableDto
{
    public Guid? Id { get; set; }

    public string CustomerName { get; set; } = string.Empty;
    public string ServiceDescription { get; set; } = string.Empty;
    public DateOnly ServiceDate { get; set; }

    public string? ServiceOrderNumber { get; set; }
    public string? InvoiceNumber { get; set; }
    public DateOnly? InvoiceIssueDate { get; set; }

    public DateOnly DueDate { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;

    public decimal GrossAmount { get; set; }
    public decimal IssAmount { get; set; }
    public decimal AmountReceived { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;

    public decimal NetAmount { get; set; }
    public decimal OutstandingAmount { get; set; }
    public string Status { get; set; } = string.Empty;
}
