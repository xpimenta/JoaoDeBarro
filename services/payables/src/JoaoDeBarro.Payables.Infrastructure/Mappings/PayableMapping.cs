using JoaoDeBarro.Payables.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JoaoDeBarro.Payables.Infrastructure.Mappings;

public class PayableMapping : IEntityTypeConfiguration<Payable>
{
    public void Configure(EntityTypeBuilder<Payable> builder)
    {
        builder.ToTable("Payables");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Description)
            .IsRequired()
            .HasColumnType("varchar(255)");

        builder.Property(x => x.DueDate)
            .IsRequired()
            .HasColumnType("date");

        builder.Property(x => x.PaymentDate)
            .HasColumnType("date");

        builder.Property(x => x.PaymentMethod)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.CurrencyCode)
            .IsRequired()
            .HasColumnType("char(3)");

        builder.Property(x => x.Category)
            .IsRequired()
            .HasColumnType("varchar(100)");

        builder.Property(x => x.Notes)
            .HasColumnType("varchar(500)");

        builder.Property<decimal>("_principalAmount")
            .HasColumnName("PrincipalAmount")
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property<decimal>("_interestAmount")
            .HasColumnName("InterestAmount")
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property<decimal>("_amountPaid")
            .HasColumnName("AmountPaid")
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Ignore(x => x.PrincipalAmount);
        builder.Ignore(x => x.InterestAmount);
        builder.Ignore(x => x.AmountPaid);
        builder.Ignore(x => x.TotalAmount);
        builder.Ignore(x => x.OutstandingAmount);
        builder.Ignore(x => x.Status);

        builder.HasIndex(x => x.DueDate);
        builder.HasIndex(x => x.PaymentMethod);
    }
}
