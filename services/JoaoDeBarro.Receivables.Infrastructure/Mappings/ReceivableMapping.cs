using JoaoDeBarro.Receivables.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JoaoDeBarro.Receivables.Infrastructure.Mappings;

public class ReceivableMapping : IEntityTypeConfiguration<Receivable>
{
    public void Configure(EntityTypeBuilder<Receivable> builder)
    {
        builder.ToTable("Receivables");

        builder.HasKey(x => x.Id);

        // -------------------------
        // Simple properties
        // -------------------------

        builder.Property(x => x.CustomerName)
            .IsRequired()
            .HasColumnType("varchar(150)");

        builder.Property(x => x.ServiceDescription)
            .IsRequired()
            .HasColumnType("varchar(255)");

        builder.Property(x => x.ServiceDate)
            .IsRequired()
            .HasColumnType("date");

        builder.Property(x => x.DueDate)
            .IsRequired()
            .HasColumnType("date");

        builder.Property(x => x.ServiceOrderNumber)
            .HasColumnType("varchar(50)");

        builder.Property(x => x.InvoiceNumber)
            .HasColumnType("varchar(50)");

        builder.Property(x => x.InvoiceIssueDate)
            .HasColumnType("date");

        builder.Property(x => x.PaymentMethod)
            .IsRequired()
            .HasConversion<int>(); // enum -> int

        // -------------------------
        // Value Objects (Money) - Owned Types
        // -------------------------

        builder.OwnsOne(x => x.GrossAmount, money =>
        {
            money.Property(p => p.Amount)
                .HasColumnName("GrossAmount")
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            money.Property(p => p.Currency)
                .HasColumnName("GrossCurrency")
                .HasColumnType("char(3)")
                .IsRequired();
        });
        builder.Navigation(x => x.GrossAmount).IsRequired();

        builder.OwnsOne(x => x.IssAmount, money =>
        {
            money.Property(p => p.Amount)
                .HasColumnName("IssAmount")
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            money.Property(p => p.Currency)
                .HasColumnName("IssCurrency")
                .HasColumnType("char(3)")
                .IsRequired();
        });
        builder.Navigation(x => x.IssAmount).IsRequired();

        builder.OwnsOne(x => x.AmountReceived, money =>
        {
            money.Property(p => p.Amount)
                .HasColumnName("AmountReceived")
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            money.Property(p => p.Currency)
                .HasColumnName("ReceivedCurrency")
                .HasColumnType("char(3)")
                .IsRequired();
        });
        builder.Navigation(x => x.AmountReceived).IsRequired();

        // -------------------------
        // Derived / calculated properties - not persisted (MVP)
        // -------------------------
        builder.Ignore(x => x.NetAmount);
        builder.Ignore(x => x.OutstandingAmount);
        builder.Ignore(x => x.Status);

        // -------------------------
        // Useful indexes (MVP)
        // -------------------------
        builder.HasIndex(x => x.DueDate);
        builder.HasIndex(x => x.CustomerName);
        builder.HasIndex(x => x.PaymentMethod);
    }
}