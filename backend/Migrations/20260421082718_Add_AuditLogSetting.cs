using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class Add_AuditLogSetting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditLogSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    RetentionYears = table.Column<int>(type: "int", nullable: false),
                    RetentionMonths = table.Column<int>(type: "int", nullable: false),
                    RetentionDays = table.Column<int>(type: "int", nullable: false),
                    RetentionHours = table.Column<int>(type: "int", nullable: false),
                    RetentionMinutes = table.Column<int>(type: "int", nullable: false),
                    RetentionSeconds = table.Column<int>(type: "int", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogSettings", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLogSettings");
        }
    }
}
