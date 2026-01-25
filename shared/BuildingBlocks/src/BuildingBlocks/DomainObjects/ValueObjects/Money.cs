using BuildingBlocks.DomainObjects.Primitives;
using JoaoDeBarro.BuildingBlocks.DomainObjects;

namespace BuildingBlocks.DomainObjects.ValueObjects;

/// <summary>
/// Money (Value Object)
/// Represents a monetary value with currency.
/// </summary>
public sealed class Money : ValueObject
{
    public decimal Amount { get; }
    public string Currency { get; }

    private Money(decimal amount, string currency)
    {
        Amount = decimal.Round(amount, 2, MidpointRounding.AwayFromZero);
        Currency = currency.ToUpperInvariant();
        Validate();
    }

    private void Validate()
    {
        AssertionConcern.AssertNotEmpty(Currency, "Currency is required.");
        AssertionConcern.AssertTrue(Amount >= 0, "Money amount must be greater than or equal to zero.");
    }

    // -------------------------
    // Factory methods
    // -------------------------

    public static Money Of(decimal amount, string currency)
        => new(amount, currency);

    public static Money Zero(string currency)
        => new(0m, currency);

    // -------------------------
    // Domain behavior
    // -------------------------

    public bool IsZero => Amount == 0m;

    // -------------------------
    // Operators
    // -------------------------

    public static Money operator +(Money left, Money right)
    {
        EnsureSameCurrency(left, right);
        return new Money(left.Amount + right.Amount, left.Currency);
    }

    public static Money operator -(Money left, Money right)
    {
        EnsureSameCurrency(left, right);

        AssertionConcern.AssertTrue(
            left.Amount >= right.Amount,
            "Resulting money amount cannot be negative."
        );

        return new Money(left.Amount - right.Amount, left.Currency);
    }

    // -------------------------
    // Equality
    // -------------------------

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }

    // -------------------------
    // Helpers
    // -------------------------

    private static void EnsureSameCurrency(Money left, Money right)
    {
        AssertionConcern.AssertTrue(
            left.Currency == right.Currency,
            "Money currency mismatch."
        );
    }

    public override string ToString()
        => $"{Currency} {Amount:N2}";
}