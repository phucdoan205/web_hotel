using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddRoleDashboardPeriodState : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Role_Dashboard_Period_States",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    role_id = table.Column<int>(type: "int", nullable: false),
                    role_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    dashboard_code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    dashboard_title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    period_type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    period_key = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    period_start = table.Column<DateTime>(type: "datetime2", nullable: false),
                    period_end = table.Column<DateTime>(type: "datetime2", nullable: false),
                    dashboard_json = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    comparison_json = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    is_current = table.Column<bool>(type: "bit", nullable: false),
                    last_event_type = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    last_event_source = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    last_event_ref_id = table.Column<int>(type: "int", nullable: true),
                    version = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    closed_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    updated_by = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Role_Dashboard_Period_States", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Role_Dashboard_Period_States_Roles_role_id",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Role_Dashboard_Period_States_Users_updated_by",
                        column: x => x.updated_by,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Role_Dashboard_Period_States_dashboard_code_role_name_period_type_period_start_period_end",
                table: "Role_Dashboard_Period_States",
                columns: new[] { "dashboard_code", "role_name", "period_type", "period_start", "period_end" });

            migrationBuilder.CreateIndex(
                name: "IX_Role_Dashboard_Period_States_role_id_dashboard_code_period_type_is_current",
                table: "Role_Dashboard_Period_States",
                columns: new[] { "role_id", "dashboard_code", "period_type", "is_current" },
                filter: "[is_current] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_Role_Dashboard_Period_States_role_id_dashboard_code_period_type_period_key",
                table: "Role_Dashboard_Period_States",
                columns: new[] { "role_id", "dashboard_code", "period_type", "period_key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Role_Dashboard_Period_States_updated_at",
                table: "Role_Dashboard_Period_States",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Role_Dashboard_Period_States_updated_by",
                table: "Role_Dashboard_Period_States",
                column: "updated_by");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Role_Dashboard_Period_States");
        }
    }
}
