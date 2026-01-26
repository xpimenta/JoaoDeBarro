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
            .HasConversion<int>();

        // 1 currency per row
        builder.Property(x => x.CurrencyCode)
            .IsRequired()
            .HasColumnType("char(3)");

        // Map backing fields as columns
        builder.Property<decimal>("_grossAmount")
            .HasColumnName("GrossAmount")
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property<decimal>("_issAmount")
            .HasColumnName("IssAmount")
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property<decimal>("_amountReceived")
            .HasColumnName("AmountReceived")
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        // Ignore domain-calculated properties
        builder.Ignore(x => x.GrossAmount);
        builder.Ignore(x => x.IssAmount);
        builder.Ignore(x => x.AmountReceived);
        builder.Ignore(x => x.NetAmount);
        builder.Ignore(x => x.OutstandingAmount);
        builder.Ignore(x => x.Status);

        // Useful indexes
        builder.HasIndex(x => x.DueDate);
        builder.HasIndex(x => x.CustomerName);
    }
}