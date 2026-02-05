using JoaoDeBarro.BuildingBlocks.DomainObjects.Data;
using JoaoDeBarro.BuildingBlocks.MediatR;
using JoaoDeBarro.BuildingBlocks.Messages;
using JoaoDeBarro.Receivables.Domain;
using Microsoft.EntityFrameworkCore;

namespace JoaoDeBarro.Receivables.Infrastructure;

public class ReceivableContext : DbContext, IUnitOfWork
{
    private readonly IMediatrHandler _mediatrHandler;
    public ReceivableContext(DbContextOptions<ReceivableContext> options, IMediatrHandler mediatrHandler) : base(options)
    {
        _mediatrHandler = mediatrHandler;
    }

    public DbSet<Receivable> Receivables { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ReceivableContext).Assembly);

        modelBuilder.Ignore<Event>();
        
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
        await _mediatrHandler.PublishEventsAsync(this);
        return await base.SaveChangesAsync() > 0;
    }
}
