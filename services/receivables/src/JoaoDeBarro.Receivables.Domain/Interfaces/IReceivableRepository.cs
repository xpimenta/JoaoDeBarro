using BuildingBlocks.DomainObjects.Data;

namespace JoaoDeBarro.Receivables.Domain.Interfaces;

public interface IReceivableRepository : IRepository<Receivable>
{
    Task<Receivable> GetReceivableAsync(Guid receivableId);
    Task<IEnumerable<Receivable>> GetReceivablesAsync();
    
    void AddReceivable(Receivable receivable);
    void UpdateReceivable(Receivable receivable);
}