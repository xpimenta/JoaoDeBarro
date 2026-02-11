using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JoaoDeBarro.Receivables.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInssAmountToReceivables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "InssAmount",
                table: "Receivables",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InssAmount",
                table: "Receivables");
        }
    }
}
