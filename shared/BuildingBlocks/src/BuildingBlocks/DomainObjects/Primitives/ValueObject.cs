using System.Collections;

namespace BuildingBlocks.DomainObjects.Primitives;

public abstract class ValueObject
{
    /// <summary>
    /// Returns the atomic values that define equality for this value object.
    /// Example: Money -> Amount, Currency
    /// </summary>
    protected abstract IEnumerable<object?> GetEqualityComponents();

    public override bool Equals(object? obj)
    {
        if (obj is null) return false;
        if (ReferenceEquals(this, obj)) return true;
        if (obj.GetType() != GetType()) return false;

        var other = (ValueObject)obj;

        return GetEqualityComponents()
            .SequenceEqual(other.GetEqualityComponents());
    }

    public override int GetHashCode()
    {
        // Combine hash codes from all equality components.
        // This is stable and avoids needing to override GetHashCode in each VO.
        return GetEqualityComponents()
            .Aggregate(0, (current, component) =>
            {
                unchecked
                {
                    return (current * 23) + (component?.GetHashCode() ?? 0);
                }
            });
    }

    public static bool operator ==(ValueObject? a, ValueObject? b)
    {
        if (a is null && b is null) return true;
        if (a is null || b is null) return false;
        return a.Equals(b);
    }

    public static bool operator !=(ValueObject? a, ValueObject? b) => !(a == b);

    /// <summary>
    /// Optional helper to support collections/arrays as equality components.
    /// If you need list equality (Address lines, tags, etc.), normalize them here.
    /// For simple VOs like Money, you won't need this.
    /// </summary>
    protected static IEnumerable<object?> GetAtomicValues(object? value)
    {
        if (value is null)
            yield break;

        // Treat string as atomic (not IEnumerable)
        if (value is string)
        {
            yield return value;
            yield break;
        }

        if (value is IEnumerable enumerable)
        {
            foreach (var item in enumerable)
                yield return item;
            yield break;
        }

        yield return value;
    }
}