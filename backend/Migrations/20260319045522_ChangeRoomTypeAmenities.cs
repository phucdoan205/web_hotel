using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class ChangeRoomTypeAmenities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoomTypeAmenties_Amenities_AmenityId",
                table: "RoomTypeAmenties");

            migrationBuilder.DropForeignKey(
                name: "FK_RoomTypeAmenties_RoomTypes_RoomTypeId",
                table: "RoomTypeAmenties");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RoomTypeAmenties",
                table: "RoomTypeAmenties");

            migrationBuilder.RenameTable(
                name: "RoomTypeAmenties",
                newName: "RoomTypeAmenities");

            migrationBuilder.RenameIndex(
                name: "IX_RoomTypeAmenties_AmenityId",
                table: "RoomTypeAmenities",
                newName: "IX_RoomTypeAmenities_AmenityId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RoomTypeAmenities",
                table: "RoomTypeAmenities",
                columns: new[] { "RoomTypeId", "AmenityId" });

            migrationBuilder.AddForeignKey(
                name: "FK_RoomTypeAmenities_Amenities_AmenityId",
                table: "RoomTypeAmenities",
                column: "AmenityId",
                principalTable: "Amenities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RoomTypeAmenities_RoomTypes_RoomTypeId",
                table: "RoomTypeAmenities",
                column: "RoomTypeId",
                principalTable: "RoomTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoomTypeAmenities_Amenities_AmenityId",
                table: "RoomTypeAmenities");

            migrationBuilder.DropForeignKey(
                name: "FK_RoomTypeAmenities_RoomTypes_RoomTypeId",
                table: "RoomTypeAmenities");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RoomTypeAmenities",
                table: "RoomTypeAmenities");

            migrationBuilder.RenameTable(
                name: "RoomTypeAmenities",
                newName: "RoomTypeAmenties");

            migrationBuilder.RenameIndex(
                name: "IX_RoomTypeAmenities_AmenityId",
                table: "RoomTypeAmenties",
                newName: "IX_RoomTypeAmenties_AmenityId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RoomTypeAmenties",
                table: "RoomTypeAmenties",
                columns: new[] { "RoomTypeId", "AmenityId" });

            migrationBuilder.AddForeignKey(
                name: "FK_RoomTypeAmenties_Amenities_AmenityId",
                table: "RoomTypeAmenties",
                column: "AmenityId",
                principalTable: "Amenities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RoomTypeAmenties_RoomTypes_RoomTypeId",
                table: "RoomTypeAmenties",
                column: "RoomTypeId",
                principalTable: "RoomTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
