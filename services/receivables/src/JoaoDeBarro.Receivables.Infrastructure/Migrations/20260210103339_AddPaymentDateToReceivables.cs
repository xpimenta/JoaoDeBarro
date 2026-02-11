using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JoaoDeBarro.Receivables.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentDateToReceivables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "PaymentDate",
                table: "Receivables",
                type: "date",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentDate",
                table: "Receivables");
        }
    }
}
