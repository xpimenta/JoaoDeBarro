using BuildingBlocks.DomainObjects.Data;
using JoaoDeBarro.Receivables.Domain;
using Microsoft.EntityFrameworkCore;

namespace JoaoDeBarro.Receivables.Infrastructure;

public class ReceivableContext : DbContext, IUnitOfWork
{
    public ReceivableContext(DbContextOptions<ReceivableContext> options) : base(options) { }

    public DbSet<Receivable> Receivables { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ReceivableContext).Assembly);
        
        foreach (var property in modelBuilder.Model
                     .GetEntityTypes()
                     .SelectMany(e => e.GetProperties())
                     .Where(p => p.ClrType == typeof(string)))
        {
            if (property.GetColumnType() == null)
                property.SetColumnType("varchar(100)");
        }
    }

    public async Task<bool> CommitAsync()
    {
        return await base.SaveChangesAsync() > 0;
    }
}