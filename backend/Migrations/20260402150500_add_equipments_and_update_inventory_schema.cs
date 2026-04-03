using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    public partial class add_equipments_and_update_inventory_schema : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
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
                newName: "Room_Inventory");

            migrationBuilder.RenameIndex(
                name: "IX_RoomInventory_RoomId",
                table: "Room_Inventory",
                newName: "IX_Room_Inventory_RoomId");

            migrationBuilder.AddColumn<int>(
                name: "EquipmentId",
                table: "Room_Inventory",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Room_Inventory",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "ItemType",
                table: "Room_Inventory",
                type: "nvarchar(100)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "Room_Inventory",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE [Room_Inventory]
                SET [ItemType] = [ItemName]
                WHERE [ItemType] IS NULL AND [ItemName] IS NOT NULL
                """);

            migrationBuilder.DropColumn(
                name: "ItemName",
                table: "Room_Inventory");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Loss_And_Damages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.DropColumn(
                name: "ResolvedAt",
                table: "Loss_And_Damages");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Loss_And_Damages");

            migrationBuilder.CreateTable(
                name: "Equipments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ItemCode = table.Column<string>(type: "varchar(50)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    TotalQuantity = table.Column<int>(type: "int", nullable: false),
                    InUseQuantity = table.Column<int>(type: "int", nullable: false),
                    DamagedQuantity = table.Column<int>(type: "int", nullable: false),
                    LiquidatedQuantity = table.Column<int>(type: "int", nullable: false),
                    InStockQuantity = table.Column<int>(type: "int", nullable: true),
                    BasePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DefaultPriceIfLost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Supplier = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Equipments", x => x.Id);
                });

            migrationBuilder.AddPrimaryKey(
                name: "PK_Room_Inventory",
                table: "Room_Inventory",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Room_Inventory_EquipmentId",
                table: "Room_Inventory",
                column: "EquipmentId");

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

        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.DropTable(
                name: "Equipments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Room_Inventory",
                table: "Room_Inventory");

            migrationBuilder.DropIndex(
                name: "IX_Room_Inventory_EquipmentId",
                table: "Room_Inventory");

            migrationBuilder.DropColumn(
                name: "EquipmentId",
                table: "Room_Inventory");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Room_Inventory");

            migrationBuilder.DropColumn(
                name: "ItemType",
                table: "Room_Inventory");

            migrationBuilder.DropColumn(
                name: "Note",
                table: "Room_Inventory");

            migrationBuilder.RenameTable(
                name: "Room_Inventory",
                newName: "RoomInventory");

            migrationBuilder.RenameIndex(
                name: "IX_Room_Inventory_RoomId",
                table: "RoomInventory",
                newName: "IX_RoomInventory_RoomId");

            migrationBuilder.AddColumn<string>(
                name: "ItemName",
                table: "RoomInventory",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql("""
                UPDATE [RoomInventory]
                SET [ItemName] = ISNULL([ItemType], '')
                """);

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Loss_And_Damages");

            migrationBuilder.AddColumn<DateTime>(
                name: "ResolvedAt",
                table: "Loss_And_Damages",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Status",
                table: "Loss_And_Damages",
                type: "bit",
                nullable: false,
                defaultValue: false);

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
    }
}
