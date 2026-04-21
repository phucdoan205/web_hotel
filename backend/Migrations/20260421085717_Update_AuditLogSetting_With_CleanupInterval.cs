using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class Update_AuditLogSetting_With_CleanupInterval : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CleanupIntervalDays",
                table: "AuditLogSettings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CleanupIntervalHours",
                table: "AuditLogSettings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CleanupIntervalMinutes",
                table: "AuditLogSettings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CleanupIntervalMonths",
                table: "AuditLogSettings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CleanupIntervalSeconds",
                table: "AuditLogSettings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CleanupIntervalYears",
                table: "AuditLogSettings",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CleanupIntervalDays",
                table: "AuditLogSettings");

            migrationBuilder.DropColumn(
                name: "CleanupIntervalHours",
                table: "AuditLogSettings");

            migrationBuilder.DropColumn(
                name: "CleanupIntervalMinutes",
                table: "AuditLogSettings");

            migrationBuilder.DropColumn(
                name: "CleanupIntervalMonths",
                table: "AuditLogSettings");

            migrationBuilder.DropColumn(
                name: "CleanupIntervalSeconds",
                table: "AuditLogSettings");

            migrationBuilder.DropColumn(
                name: "CleanupIntervalYears",
                table: "AuditLogSettings");
        }
    }
}
