using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class serviceuser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Order_Services",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Order_Services_UserId",
                table: "Order_Services",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Order_Services_Users_UserId",
                table: "Order_Services",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Order_Services_Users_UserId",
                table: "Order_Services");

            migrationBuilder.DropIndex(
                name: "IX_Order_Services_UserId",
                table: "Order_Services");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Order_Services");
        }
    }
}
