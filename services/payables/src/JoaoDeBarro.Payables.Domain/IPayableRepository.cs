using JoaoDeBarro.BuildingBlocks.DomainObjects.Data;

namespace JoaoDeBarro.Payables.Domain;

public interface IPayableRepository : IRepository<Payable>
{
    Task<Payable?> GetPayableAsync(Guid PayableId);
    Task<IEnumerable<Payable>> GetPayablesAsync();
    
    void AddPayable(Payable Payable);
    void UpdatePayable(Payable Payable);
}