namespace BuildingBlocks.DomainObjects.Data;

public interface IUnitOfWork
{
    Task<bool> CommitAsync();
}