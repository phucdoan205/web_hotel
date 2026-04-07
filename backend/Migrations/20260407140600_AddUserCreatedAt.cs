using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddUserCreatedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Users_UserId",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Memberships_MembershipId",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Roles_RoleId",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "Code",
                table: "Vouchers",
                newName: "code");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Vouchers",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "ValidTo",
                table: "Vouchers",
                newName: "valid_to");

            migrationBuilder.RenameColumn(
                name: "ValidFrom",
                table: "Vouchers",
                newName: "valid_from");

            migrationBuilder.RenameColumn(
                name: "UsageLimit",
                table: "Vouchers",
                newName: "usage_limit");

            migrationBuilder.RenameColumn(
                name: "MinBookingValue",
                table: "Vouchers",
                newName: "min_booking_value");

            migrationBuilder.RenameColumn(
                name: "DiscountValue",
                table: "Vouchers",
                newName: "discount_value");

            migrationBuilder.RenameColumn(
                name: "DiscountType",
                table: "Vouchers",
                newName: "discount_type");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Users",
                newName: "status");

            migrationBuilder.RenameColumn(
                name: "Phone",
                table: "Users",
                newName: "phone");

            migrationBuilder.RenameColumn(
                name: "Email",
                table: "Users",
                newName: "email");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Users",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "RoleId",
                table: "Users",
                newName: "role_id");

            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                table: "Users",
                newName: "password_hash");

            migrationBuilder.RenameColumn(
                name: "MembershipId",
                table: "Users",
                newName: "membership_id");

            migrationBuilder.RenameColumn(
                name: "FullName",
                table: "Users",
                newName: "full_name");

            migrationBuilder.RenameIndex(
                name: "IX_Users_RoleId",
                table: "Users",
                newName: "IX_Users_role_id");

            migrationBuilder.RenameIndex(
                name: "IX_Users_MembershipId",
                table: "Users",
                newName: "IX_Users_membership_id");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Notifications",
                newName: "User_Id");

            migrationBuilder.RenameColumn(
                name: "ReferenceLink",
                table: "Notifications",
                newName: "Reference_Link");

            migrationBuilder.RenameColumn(
                name: "IsRead",
                table: "Notifications",
                newName: "Is_Read");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Notifications",
                newName: "Created_At");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                newName: "IX_Notifications_User_Id");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Memberships",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "TierName",
                table: "Memberships",
                newName: "tier_name");

            migrationBuilder.RenameColumn(
                name: "MinPoints",
                table: "Memberships",
                newName: "min_points");

            migrationBuilder.RenameColumn(
                name: "DiscountPercent",
                table: "Memberships",
                newName: "discount_percent");

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Users_User_Id",
                table: "Notifications",
                column: "User_Id",
                principalTable: "Users",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Memberships_membership_id",
                table: "Users",
                column: "membership_id",
                principalTable: "Memberships",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Roles_role_id",
                table: "Users",
                column: "role_id",
                principalTable: "Roles",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Users_User_Id",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Memberships_membership_id",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Roles_role_id",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "code",
                table: "Vouchers",
                newName: "Code");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Vouchers",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "valid_to",
                table: "Vouchers",
                newName: "ValidTo");

            migrationBuilder.RenameColumn(
                name: "valid_from",
                table: "Vouchers",
                newName: "ValidFrom");

            migrationBuilder.RenameColumn(
                name: "usage_limit",
                table: "Vouchers",
                newName: "UsageLimit");

            migrationBuilder.RenameColumn(
                name: "min_booking_value",
                table: "Vouchers",
                newName: "MinBookingValue");

            migrationBuilder.RenameColumn(
                name: "discount_value",
                table: "Vouchers",
                newName: "DiscountValue");

            migrationBuilder.RenameColumn(
                name: "discount_type",
                table: "Vouchers",
                newName: "DiscountType");

            migrationBuilder.RenameColumn(
                name: "status",
                table: "Users",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "phone",
                table: "Users",
                newName: "Phone");

            migrationBuilder.RenameColumn(
                name: "email",
                table: "Users",
                newName: "Email");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Users",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "role_id",
                table: "Users",
                newName: "RoleId");

            migrationBuilder.RenameColumn(
                name: "password_hash",
                table: "Users",
                newName: "PasswordHash");

            migrationBuilder.RenameColumn(
                name: "membership_id",
                table: "Users",
                newName: "MembershipId");

            migrationBuilder.RenameColumn(
                name: "full_name",
                table: "Users",
                newName: "FullName");

            migrationBuilder.RenameIndex(
                name: "IX_Users_role_id",
                table: "Users",
                newName: "IX_Users_RoleId");

            migrationBuilder.RenameIndex(
                name: "IX_Users_membership_id",
                table: "Users",
                newName: "IX_Users_MembershipId");

            migrationBuilder.RenameColumn(
                name: "User_Id",
                table: "Notifications",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "Reference_Link",
                table: "Notifications",
                newName: "ReferenceLink");

            migrationBuilder.RenameColumn(
                name: "Is_Read",
                table: "Notifications",
                newName: "IsRead");

            migrationBuilder.RenameColumn(
                name: "Created_At",
                table: "Notifications",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_User_Id",
                table: "Notifications",
                newName: "IX_Notifications_UserId");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Memberships",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "tier_name",
                table: "Memberships",
                newName: "TierName");

            migrationBuilder.RenameColumn(
                name: "min_points",
                table: "Memberships",
                newName: "MinPoints");

            migrationBuilder.RenameColumn(
                name: "discount_percent",
                table: "Memberships",
                newName: "DiscountPercent");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Users_UserId",
                table: "Notifications",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Memberships_MembershipId",
                table: "Users",
                column: "MembershipId",
                principalTable: "Memberships",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Roles_RoleId",
                table: "Users",
                column: "RoleId",
                principalTable: "Roles",
                principalColumn: "Id");
        }
    }
}
