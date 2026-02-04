using JoaoDeBarro.BuildingBlocks.DomainObjects.Data;
using JoaoDeBarro.Payables.Domain;
using Microsoft.EntityFrameworkCore;

namespace JoaoDeBarro.Payables.Infrastructure;

public class PayableContext : DbContext, IUnitOfWork
{
    public PayableContext(DbContextOptions<PayableContext> options) : base(options) { }

    public DbSet<Payable> Payables { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PayableContext).Assembly);

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
