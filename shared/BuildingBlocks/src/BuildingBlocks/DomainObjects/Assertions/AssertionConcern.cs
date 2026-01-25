namespace JoaoDeBarro.BuildingBlocks.DomainObjects;

public class AssertionConcern
{
    public static void AssertNotNull(object? value, string message)
    {
        if (value is null)
            throw new DomainException(message);
    }

    public static void AssertNotEmpty(string value, string message)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new DomainException(message);
    }

    public static void AssertTrue(bool condition, string message)
    {
        if (!condition)
            throw new DomainException(message);
    }

    public static void AssertFalse(bool condition, string message)
    {
        if (condition)
            throw new DomainException(message);
    }

    public static void AssertGreaterThan(decimal value, decimal min, string message)
    {
        if (value <= min)
            throw new DomainException(message);
    }

    public static void AssertGreaterOrEqualThan(decimal value, decimal min, string message)
    {
        if (value < min)
            throw new DomainException(message);
    }
}