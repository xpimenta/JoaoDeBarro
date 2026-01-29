using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JoaoDeBarro.Receivables.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Receivables",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerName = table.Column<string>(type: "varchar(150)", nullable: false),
                    ServiceDescription = table.Column<string>(type: "varchar(255)", nullable: false),
                    ServiceDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ServiceOrderNumber = table.Column<string>(type: "varchar(50)", nullable: true),
                    InvoiceNumber = table.Column<string>(type: "varchar(50)", nullable: true),
                    InvoiceIssueDate = table.Column<DateOnly>(type: "date", nullable: true),
                    DueDate = table.Column<DateOnly>(type: "date", nullable: false),
                    PaymentMethod = table.Column<int>(type: "int", nullable: false),
                    CurrencyCode = table.Column<string>(type: "char(3)", nullable: false),
                    AmountReceived = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrossAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IssAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Receivables", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Receivables_CustomerName",
                table: "Receivables",
                column: "CustomerName");

            migrationBuilder.CreateIndex(
                name: "IX_Receivables_DueDate",
                table: "Receivables",
                column: "DueDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Receivables");
        }
    }
}
