using AutoMapper;
using JoaoDeBarro.BuildingBlocks.DomainObjects.ValueObjects;
using JoaoDeBarro.Receivables.Application.DTOs;
using JoaoDeBarro.Receivables.Domain;

namespace JoaoDeBarro.Receivables.Application.AutoMapper;

public class ReceivablesMappingProfile : Profile
{
    public ReceivablesMappingProfile()
    {
        CreateMap<Receivable, ReceivableDto>()
            .ForMember(d => d.PaymentMethod, opt => opt.MapFrom(s => s.PaymentMethod.ToString()))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.GrossAmount, opt => opt.MapFrom(s => s.GrossAmount.Amount))
            .ForMember(d => d.IssAmount, opt => opt.MapFrom(s => s.IssAmount.Amount))
            .ForMember(d => d.AmountReceived, opt => opt.MapFrom(s => s.AmountReceived.Amount))
            .ForMember(d => d.NetAmount, opt => opt.MapFrom(s => s.NetAmount.Amount))
            .ForMember(d => d.OutstandingAmount, opt => opt.MapFrom(s => s.OutstandingAmount.Amount))
            .ForMember(d => d.CurrencyCode, opt => opt.MapFrom(s => s.GrossAmount.Currency));

        CreateMap<ReceivableDto, Receivable>()
            .ConstructUsing(dto => new Receivable(
                dto.CustomerName,
                dto.ServiceDescription,
                dto.ServiceDate,
                dto.DueDate,
                ParsePaymentMethod(dto.PaymentMethod),
                Money.Of(dto.GrossAmount, dto.CurrencyCode),
                Money.Of(dto.IssAmount, dto.CurrencyCode)))
            .ForMember(d => d.NetAmount, opt => opt.Ignore())
            .ForMember(d => d.OutstandingAmount, opt => opt.Ignore())
            .ForMember(d => d.Status, opt => opt.Ignore())
            .AfterMap((dto, entity) =>
            {
                if (dto.Id != Guid.Empty)
                    entity.Id = dto.Id;

                if (!string.IsNullOrWhiteSpace(dto.ServiceOrderNumber))
                    entity.SetServiceOrder(dto.ServiceOrderNumber);

                if (!string.IsNullOrWhiteSpace(dto.InvoiceNumber) && dto.InvoiceIssueDate.HasValue)
                    entity.SetInvoice(dto.InvoiceNumber, dto.InvoiceIssueDate.Value);

                if (dto.AmountReceived > 0)
                    entity.RegisterReceipt(Money.Of(dto.AmountReceived, dto.CurrencyCode));
            });
    }

    private static PaymentMethod ParsePaymentMethod(string value)
    {
        return Enum.Parse<PaymentMethod>(value, ignoreCase: true);
    }
}
