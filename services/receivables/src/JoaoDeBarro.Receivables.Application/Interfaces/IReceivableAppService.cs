using JoaoDeBarro.Receivables.Application.DTOs;

namespace JoaoDeBarro.Receivables.Application.Interfaces;

public interface IReceivableAppService
{
    Task<ReceivableDto?> GetReceivableAsync(Guid receivableId);
    Task<IEnumerable<ReceivableDto>> GetReceivablesAsync();
    
    Task AddReceivable(ReceivableDto receivable);
    Task UpdateReceivable(ReceivableDto receivable);
}