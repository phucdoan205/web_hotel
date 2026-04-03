using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class newww : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ItemName",
                table: "RoomInventory");

            migrationBuilder.DropColumn(
                name: "ResolvedAt",
                table: "Loss_And_Damages");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Loss_And_Damages");

            migrationBuilder.AddColumn<int>(
                name: "EquipmentId",
                table: "RoomInventory",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "RoomInventory",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ItemType",
                table: "RoomInventory",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "RoomInventory",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Loss_And_Damages",
                type: "datetime",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Loss_And_Damages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Equipments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ItemCode = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TotalQuantity = table.Column<int>(type: "int", nullable: false),
                    InUseQuantity = table.Column<int>(type: "int", nullable: false),
                    DamagedQuantity = table.Column<int>(type: "int", nullable: false),
                    LiquidatedQuantity = table.Column<int>(type: "int", nullable: false),
                    InStockQuantity = table.Column<int>(type: "int", nullable: true),
                    BasePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DefaultPriceIfLost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Supplier = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Equipments", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RoomInventory_EquipmentId",
                table: "RoomInventory",
                column: "EquipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Equipments_ItemCode",
                table: "Equipments",
                column: "ItemCode",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_RoomInventory_Equipments_EquipmentId",
                table: "RoomInventory",
                column: "EquipmentId",
                principalTable: "Equipments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoomInventory_Equipments_EquipmentId",
                table: "RoomInventory");

            migrationBuilder.DropTable(
                name: "Equipments");

            migrationBuilder.DropIndex(
                name: "IX_RoomInventory_EquipmentId",
                table: "RoomInventory");

            migrationBuilder.DropColumn(
                name: "EquipmentId",
                table: "RoomInventory");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "RoomInventory");

            migrationBuilder.DropColumn(
                name: "ItemType",
                table: "RoomInventory");

            migrationBuilder.DropColumn(
                name: "Note",
                table: "RoomInventory");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Loss_And_Damages");

            migrationBuilder.AddColumn<string>(
                name: "ItemName",
                table: "RoomInventory",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Loss_And_Damages",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true);

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
        }
    }
}
