using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class PatchLossAndDamageWorkflowFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
IF OBJECT_ID(N'loss_and_damages', N'U') IS NOT NULL
BEGIN
    IF COL_LENGTH(N'loss_and_damages', N'image_url') IS NULL
        ALTER TABLE [loss_and_damages] ADD [image_url] nvarchar(max) NULL;

    IF COL_LENGTH(N'loss_and_damages', N'status') IS NULL
        ALTER TABLE [loss_and_damages] ADD [status] bit NOT NULL CONSTRAINT [DF_loss_and_damages_status] DEFAULT(0);

    IF COL_LENGTH(N'loss_and_damages', N'decision_status') IS NULL
        ALTER TABLE [loss_and_damages] ADD [decision_status] int NOT NULL CONSTRAINT [DF_loss_and_damages_decision_status] DEFAULT(0);

    IF COL_LENGTH(N'loss_and_damages', N'resolved_at') IS NULL
        ALTER TABLE [loss_and_damages] ADD [resolved_at] datetime2 NULL;
END
""");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
