using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class roomclean : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssignedUserId",
                table: "Rooms",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_AssignedUserId",
                table: "Rooms",
                column: "AssignedUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Rooms_Users_AssignedUserId",
                table: "Rooms",
                column: "AssignedUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rooms_Users_AssignedUserId",
                table: "Rooms");

            migrationBuilder.DropIndex(
                name: "IX_Rooms_AssignedUserId",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "AssignedUserId",
                table: "Rooms");
        }
    }
}
