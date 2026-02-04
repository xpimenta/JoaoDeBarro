using JoaoDeBarro.BuildingBlocks.DomainObjects.Data;
using JoaoDeBarro.Payables.Domain;
using Microsoft.EntityFrameworkCore;

namespace JoaoDeBarro.Payables.Infrastructure.Repositories;

public class PayableRepository : IPayableRepository
{
    private readonly PayableContext _context;

    public PayableRepository(PayableContext context)
    {
        _context = context;
    }

    public IUnitOfWork UnitOfWork => _context;

    public async Task<Payable?> GetPayableAsync(Guid payableId)
    {
        return await _context.Payables
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == payableId);
    }

    public async Task<IEnumerable<Payable>> GetPayablesAsync()
    {
        return await _context.Payables.AsNoTracking().ToListAsync();
    }

    public void AddPayable(Payable payable)
    {
        _context.Payables.Add(payable);
    }

    public void UpdatePayable(Payable payable)
    {
        _context.Payables.Update(payable);
    }
}
