using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Loss_And_Damages_RoomInventories_RoomInventoryId",
                table: "Loss_And_Damages");

            migrationBuilder.DropForeignKey(
                name: "FK_RoomInventories_Rooms_RoomId",
                table: "RoomInventories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RoomInventories",
                table: "RoomInventories");

            migrationBuilder.RenameTable(
                name: "RoomInventories",
                newName: "RoomInventory");

            migrationBuilder.RenameIndex(
                name: "IX_RoomInventories_RoomId",
                table: "RoomInventory",
                newName: "IX_RoomInventory_RoomId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RoomInventory",
                table: "RoomInventory",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Loss_And_Damages_RoomInventory_RoomInventoryId",
                table: "Loss_And_Damages",
                column: "RoomInventoryId",
                principalTable: "RoomInventory",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RoomInventory_Rooms_RoomId",
                table: "RoomInventory",
                column: "RoomId",
                principalTable: "Rooms",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Loss_And_Damages_RoomInventory_RoomInventoryId",
                table: "Loss_And_Damages");

            migrationBuilder.DropForeignKey(
                name: "FK_RoomInventory_Rooms_RoomId",
                table: "RoomInventory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RoomInventory",
                table: "RoomInventory");

            migrationBuilder.RenameTable(
                name: "RoomInventory",
                newName: "RoomInventories");

            migrationBuilder.RenameIndex(
                name: "IX_RoomInventory_RoomId",
                table: "RoomInventories",
                newName: "IX_RoomInventories_RoomId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RoomInventories",
                table: "RoomInventories",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Loss_And_Damages_RoomInventories_RoomInventoryId",
                table: "Loss_And_Damages",
                column: "RoomInventoryId",
                principalTable: "RoomInventories",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RoomInventories_Rooms_RoomId",
                table: "RoomInventories",
                column: "RoomId",
                principalTable: "Rooms",
                principalColumn: "Id");
        }
    }
}
