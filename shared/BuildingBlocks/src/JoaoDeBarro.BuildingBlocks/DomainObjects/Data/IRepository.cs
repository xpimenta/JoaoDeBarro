using JoaoDeBarro.BuildingBlocks.DomainObjects;

namespace JoaoDeBarro.BuildingBlocks.DomainObjects.Data;

public interface IRepository<T> where T : IAggregateRoot
{
    IUnitOfWork UnitOfWork { get; }
}
