using System.Runtime.InteropServices.JavaScript;
using JoaoDeBarro.BuildingBlocks.DomainObjects;
using JoaoDeBarro.SharedKernel.Enums;

namespace JoaoDeBarroPayables.Domain;

public class Payable : Entity, IAggregateRoot
{
    public string Description { get; }
    public string CurrencyCode { get; set; }
    public decimal PrincipalamountValue { get; set; }
    public decimal InterestAmoutValue { get; set; }
    public decimal AmountPaidValue { get; set; }
    public DateOnly DueDate { get; set; }
    public DateOnly? PaymentDate { get; set; }
    public PaymentMethod Type { get; set; }
}
