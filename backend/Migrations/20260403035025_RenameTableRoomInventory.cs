using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class RenameTableRoomInventory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Loss_And_Damages_Room_Inventory_RoomInventoryId",
                table: "Loss_And_Damages");

            migrationBuilder.DropForeignKey(
                name: "FK_Room_Inventory_Equipments_EquipmentId",
                table: "Room_Inventory");

            migrationBuilder.DropForeignKey(
                name: "FK_Room_Inventory_Rooms_RoomId",
                table: "Room_Inventory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Room_Inventory",
                table: "Room_Inventory");

            migrationBuilder.RenameTable(
                name: "Room_Inventory",
                newName: "RoomInventory");

            migrationBuilder.RenameIndex(
                name: "IX_Room_Inventory_RoomId",
                table: "RoomInventory",
                newName: "IX_RoomInventory_RoomId");

            migrationBuilder.RenameIndex(
                name: "IX_Room_Inventory_EquipmentId",
                table: "RoomInventory",
                newName: "IX_RoomInventory_EquipmentId");

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
                name: "FK_RoomInventory_Equipments_EquipmentId",
                table: "RoomInventory",
                column: "EquipmentId",
                principalTable: "Equipments",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_RoomInventory_Rooms_RoomId",
                table: "RoomInventory",
                column: "RoomId",
                principalTable: "Rooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Loss_And_Damages_RoomInventory_RoomInventoryId",
                table: "Loss_And_Damages");

            migrationBuilder.DropForeignKey(
                name: "FK_RoomInventory_Equipments_EquipmentId",
                table: "RoomInventory");

            migrationBuilder.DropForeignKey(
                name: "FK_RoomInventory_Rooms_RoomId",
                table: "RoomInventory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RoomInventory",
                table: "RoomInventory");

            migrationBuilder.RenameTable(
                name: "RoomInventory",
                newName: "Room_Inventory");

            migrationBuilder.RenameIndex(
                name: "IX_RoomInventory_RoomId",
                table: "Room_Inventory",
                newName: "IX_Room_Inventory_RoomId");

            migrationBuilder.RenameIndex(
                name: "IX_RoomInventory_EquipmentId",
                table: "Room_Inventory",
                newName: "IX_Room_Inventory_EquipmentId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Room_Inventory",
                table: "Room_Inventory",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Loss_And_Damages_Room_Inventory_RoomInventoryId",
                table: "Loss_And_Damages",
                column: "RoomInventoryId",
                principalTable: "Room_Inventory",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Room_Inventory_Equipments_EquipmentId",
                table: "Room_Inventory",
                column: "EquipmentId",
                principalTable: "Equipments",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Room_Inventory_Rooms_RoomId",
                table: "Room_Inventory",
                column: "RoomId",
                principalTable: "Rooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
