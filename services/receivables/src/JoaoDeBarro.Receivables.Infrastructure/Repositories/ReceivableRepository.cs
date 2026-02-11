using JoaoDeBarro.BuildingBlocks.DomainObjects.Data;
using JoaoDeBarro.Receivables.Domain;
using JoaoDeBarro.Receivables.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JoaoDeBarro.Receivables.Infrastructure.Repositories;

public class ReceivableRepository : IReceivableRepository
{
    private readonly ReceivableContext _context;

    public ReceivableRepository(ReceivableContext context)
    {
        _context = context;
    }

    public IUnitOfWork UnitOfWork => _context;

    public async Task<Receivable?> GetReceivableAsync(Guid receivableId)
    {
        return await _context.Receivables
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == receivableId);
    }

    public async Task<IEnumerable<Receivable>> GetReceivablesAsync()
    {
        return await _context.Receivables
            .AsNoTracking()
            .OrderBy(r => r.DueDate)
            .ThenBy(r => r.CustomerName)
            .ToListAsync();
    }

    public async Task<IEnumerable<Receivable>> GetReceivablesByDueMonthAsync(int year, int month)
    {
        var start = new DateOnly(year, month, 1);
        var end = start.AddMonths(1);

        return await _context.Receivables
            .AsNoTracking()
            .Where(r => r.DueDate >= start && r.DueDate < end)
            .OrderBy(r => r.DueDate)
            .ThenBy(r => r.CustomerName)
            .ToListAsync();
    }

    public void AddReceivable(Receivable receivable)
    {
        _context.Receivables.Add(receivable);
    }

    public void UpdateReceivable(Receivable receivable)
    {
        _context.Receivables.Update(receivable);
    }
    
}
