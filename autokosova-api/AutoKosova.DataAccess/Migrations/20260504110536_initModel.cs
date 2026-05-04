using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoKosova.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class initModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Accounts_AccountsRole_AccountRoleID",
                table: "Accounts");

            migrationBuilder.DropForeignKey(
                name: "FK_Accounts_Accounts_AccountDeletedByAccountID",
                table: "Accounts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AccountsRole",
                table: "AccountsRole");

            migrationBuilder.DropColumn(
                name: "AccountBirthDate",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "AccountGender",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "AccountIDExpirationDate",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "AccountIDImageBack",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "AccountIDImageFront",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "AccountKYCRejectReason",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "AccountPassword",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "AccountPhoneConfirmationPIN",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "AccountPrivacyPolicyAcceptedDate",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "AccountPrivateKey",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "AccountSelfieImage",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "AccountTermsAcceptedDate",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "AccountTwoFactorEnabled",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "AccountVerifiedDate",
                table: "Accounts");

            migrationBuilder.RenameTable(
                name: "AccountsRole",
                newName: "AccountRoles");

            migrationBuilder.RenameColumn(
                name: "AccountVerified",
                table: "Accounts",
                newName: "AccountIsActive");

            migrationBuilder.RenameColumn(
                name: "AccountTermsVersion",
                table: "Accounts",
                newName: "AccountCity");

            migrationBuilder.RenameColumn(
                name: "AccountPersonalNumber",
                table: "Accounts",
                newName: "AccountPasswordHash");

            migrationBuilder.RenameColumn(
                name: "AccountDeletedByAccountID",
                table: "Accounts",
                newName: "AccountDeletedByID");

            migrationBuilder.RenameIndex(
                name: "IX_Accounts_AccountDeletedByAccountID",
                table: "Accounts",
                newName: "IX_Accounts_AccountDeletedByID");

            migrationBuilder.AlterColumn<string>(
                name: "AccountPhoneNumber",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "AccountLockDate",
                table: "Accounts",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "AccountLastPasswordChangeDate",
                table: "Accounts",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "AccountLastLoginDate",
                table: "Accounts",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "AccountLastFailedLoginDate",
                table: "Accounts",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "AccountForgetPasswordPINExpirationDate",
                table: "Accounts",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<int>(
                name: "AccountForgetPasswordPIN",
                table: "Accounts",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "AccountEmailConfirmationPINExpirationDate",
                table: "Accounts",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<int>(
                name: "AccountEmailConfirmationPIN",
                table: "Accounts",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "AccountDeletedDate",
                table: "Accounts",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "AccountAddress",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<bool>(
                name: "AccountEmailConfirmed",
                table: "Accounts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddPrimaryKey(
                name: "PK_AccountRoles",
                table: "AccountRoles",
                column: "AccountRoleID");

            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    TenantID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TenantBusinessNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenantEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenantPhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenantCity = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenantAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenantIsActive = table.Column<bool>(type: "bit", nullable: false),
                    TenantCreationDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.TenantID);
                });

            migrationBuilder.CreateTable(
                name: "Cars",
                columns: table => new
                {
                    CarsID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: true),
                    CreatedByAccountID = table.Column<int>(type: "int", nullable: false),
                    CarTitle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CarBrand = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CarModel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CarYear = table.Column<int>(type: "int", nullable: false),
                    CarMileage = table.Column<int>(type: "int", nullable: false),
                    CarFuelType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CarTransmission = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CarBodyType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CarColor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CarDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsForSale = table.Column<bool>(type: "bit", nullable: false),
                    SalePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IsForRent = table.Column<bool>(type: "bit", nullable: false),
                    RentalDailyPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CarStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CarCreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CarUpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CarDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CarDeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cars", x => x.CarsID);
                    table.ForeignKey(
                        name: "FK_Cars_Accounts_CreatedByAccountID",
                        column: x => x.CreatedByAccountID,
                        principalTable: "Accounts",
                        principalColumn: "AccountID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Cars_Tenants_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenants",
                        principalColumn: "TenantID");
                });

            migrationBuilder.CreateTable(
                name: "CarImages",
                columns: table => new
                {
                    CarImageID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CarID = table.Column<int>(type: "int", nullable: false),
                    CarImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CarImageIsMain = table.Column<bool>(type: "bit", nullable: false),
                    CarImageOrderNumber = table.Column<int>(type: "int", nullable: false),
                    CarImageCreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CarImageDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CarImageDeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarImages", x => x.CarImageID);
                    table.ForeignKey(
                        name: "FK_CarImages_Cars_CarID",
                        column: x => x.CarID,
                        principalTable: "Cars",
                        principalColumn: "CarsID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RentalBookings",
                columns: table => new
                {
                    RentalBookingID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantID = table.Column<int>(type: "int", nullable: false),
                    CarID = table.Column<int>(type: "int", nullable: false),
                    CustomerAccountID = table.Column<int>(type: "int", nullable: false),
                    RentalBookingStartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RentalBookingEndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RentalBookingDailyPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RentalBookingTotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RentalBookingStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RentalBookingCreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RentalBookingUpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RentalBookingDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RentalBookingDeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RentalBookings", x => x.RentalBookingID);
                    table.ForeignKey(
                        name: "FK_RentalBookings_Accounts_CustomerAccountID",
                        column: x => x.CustomerAccountID,
                        principalTable: "Accounts",
                        principalColumn: "AccountID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RentalBookings_Cars_CarID",
                        column: x => x.CarID,
                        principalTable: "Cars",
                        principalColumn: "CarsID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RentalBookings_Tenants_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenants",
                        principalColumn: "TenantID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CarImages_CarID",
                table: "CarImages",
                column: "CarID");

            migrationBuilder.CreateIndex(
                name: "IX_Cars_CreatedByAccountID",
                table: "Cars",
                column: "CreatedByAccountID");

            migrationBuilder.CreateIndex(
                name: "IX_Cars_TenantID",
                table: "Cars",
                column: "TenantID");

            migrationBuilder.CreateIndex(
                name: "IX_RentalBookings_CarID",
                table: "RentalBookings",
                column: "CarID");

            migrationBuilder.CreateIndex(
                name: "IX_RentalBookings_CustomerAccountID",
                table: "RentalBookings",
                column: "CustomerAccountID");

            migrationBuilder.CreateIndex(
                name: "IX_RentalBookings_TenantID",
                table: "RentalBookings",
                column: "TenantID");

            migrationBuilder.AddForeignKey(
                name: "FK_Accounts_AccountRoles_AccountRoleID",
                table: "Accounts",
                column: "AccountRoleID",
                principalTable: "AccountRoles",
                principalColumn: "AccountRoleID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Accounts_Accounts_AccountDeletedByID",
                table: "Accounts",
                column: "AccountDeletedByID",
                principalTable: "Accounts",
                principalColumn: "AccountID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Accounts_AccountRoles_AccountRoleID",
                table: "Accounts");

            migrationBuilder.DropForeignKey(
                name: "FK_Accounts_Accounts_AccountDeletedByID",
                table: "Accounts");

            migrationBuilder.DropTable(
                name: "CarImages");

            migrationBuilder.DropTable(
                name: "RentalBookings");

            migrationBuilder.DropTable(
                name: "Cars");

            migrationBuilder.DropTable(
                name: "Tenants");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AccountRoles",
                table: "AccountRoles");

            migrationBuilder.DropColumn(
                name: "AccountEmailConfirmed",
                table: "Accounts");

            migrationBuilder.RenameTable(
                name: "AccountRoles",
                newName: "AccountsRole");

            migrationBuilder.RenameColumn(
                name: "AccountPasswordHash",
                table: "Accounts",
                newName: "AccountPersonalNumber");

            migrationBuilder.RenameColumn(
                name: "AccountIsActive",
                table: "Accounts",
                newName: "AccountVerified");

            migrationBuilder.RenameColumn(
                name: "AccountDeletedByID",
                table: "Accounts",
                newName: "AccountDeletedByAccountID");

            migrationBuilder.RenameColumn(
                name: "AccountCity",
                table: "Accounts",
                newName: "AccountTermsVersion");

            migrationBuilder.RenameIndex(
                name: "IX_Accounts_AccountDeletedByID",
                table: "Accounts",
                newName: "IX_Accounts_AccountDeletedByAccountID");

            migrationBuilder.AlterColumn<string>(
                name: "AccountPhoneNumber",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "AccountLockDate",
                table: "Accounts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "AccountLastPasswordChangeDate",
                table: "Accounts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "AccountLastLoginDate",
                table: "Accounts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "AccountLastFailedLoginDate",
                table: "Accounts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "AccountForgetPasswordPINExpirationDate",
                table: "Accounts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "AccountForgetPasswordPIN",
                table: "Accounts",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "AccountEmailConfirmationPINExpirationDate",
                table: "Accounts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "AccountEmailConfirmationPIN",
                table: "Accounts",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "AccountDeletedDate",
                table: "Accounts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AccountAddress",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AccountBirthDate",
                table: "Accounts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "AccountGender",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AccountIDExpirationDate",
                table: "Accounts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "AccountIDImageBack",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AccountIDImageFront",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AccountKYCRejectReason",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AccountPassword",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "AccountPhoneConfirmationPIN",
                table: "Accounts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "AccountPrivacyPolicyAcceptedDate",
                table: "Accounts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "AccountPrivateKey",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AccountSelfieImage",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AccountTermsAcceptedDate",
                table: "Accounts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "AccountTwoFactorEnabled",
                table: "Accounts",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AccountVerifiedDate",
                table: "Accounts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddPrimaryKey(
                name: "PK_AccountsRole",
                table: "AccountsRole",
                column: "AccountRoleID");

            migrationBuilder.AddForeignKey(
                name: "FK_Accounts_AccountsRole_AccountRoleID",
                table: "Accounts",
                column: "AccountRoleID",
                principalTable: "AccountsRole",
                principalColumn: "AccountRoleID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Accounts_Accounts_AccountDeletedByAccountID",
                table: "Accounts",
                column: "AccountDeletedByAccountID",
                principalTable: "Accounts",
                principalColumn: "AccountID");
        }
    }
}
