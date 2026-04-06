using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddLoyaltyVoucherAndSpending : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Vouchers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Vouchers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalSpending",
                table: "Users",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_Vouchers_UserId",
                table: "Vouchers",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Vouchers_Users_UserId",
                table: "Vouchers",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vouchers_Users_UserId",
                table: "Vouchers");

            migrationBuilder.DropIndex(
                name: "IX_Vouchers_UserId",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "TotalSpending",
                table: "Users");
        }
    }
}
