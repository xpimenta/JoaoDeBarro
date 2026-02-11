using JoaoDeBarro.Receivables.Application.DTOs;

namespace JoaoDeBarro.Receivables.Application.Interfaces;

public interface IReceivableAppService
{
    Task<ReceivableDto?> GetReceivableAsync(Guid receivableId);
    Task<IEnumerable<ReceivableDto>> GetReceivablesAsync();
    Task<IEnumerable<ReceivableDto>> GetReceivablesByDueMonthAsync(int year, int month);
    
    Task<Guid> AddReceivable(ReceivableDto receivable);
    Task<IReadOnlyCollection<Guid>> AddReceivables(IEnumerable<ReceivableDto> receivables);
    Task UpdateReceivable(ReceivableDto receivable);
}
