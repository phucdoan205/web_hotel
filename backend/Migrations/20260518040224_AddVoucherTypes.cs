using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddVoucherTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TargetUserId",
                table: "Vouchers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VoucherType",
                table: "Vouchers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Vouchers_TargetUserId",
                table: "Vouchers",
                column: "TargetUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Vouchers_Users_TargetUserId",
                table: "Vouchers",
                column: "TargetUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vouchers_Users_TargetUserId",
                table: "Vouchers");

            migrationBuilder.DropIndex(
                name: "IX_Vouchers_TargetUserId",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "TargetUserId",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "VoucherType",
                table: "Vouchers");
        }
    }
}
