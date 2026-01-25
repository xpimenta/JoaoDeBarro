using JoaoDeBarro.BuildingBlocks.DomainObjects;

namespace BuildingBlocks.DomainObjects.Data;

public interface IRepository<T> : IDisposable where T : IAggregateRoot
{
    IUnitOfWork UnitOfWork { get; }
}