namespace JoaoDeBarro.BuildingBlocks.Messages;

public abstract class Message
{
    public string Type { get; set; }
    public Guid AggregateId { get; set; }

    protected Message()
    {
        Type = GetType().Name;
    }
}
