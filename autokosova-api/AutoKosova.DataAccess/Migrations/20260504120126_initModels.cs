using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoKosova.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class initModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AccountRoles",
                columns: table => new
                {
                    AccountRoleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountRoleName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountRoleDescription = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountRoles", x => x.AccountRoleID);
                });

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
                name: "Accounts",
                columns: table => new
                {
                    AccountID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountRoleID = table.Column<int>(type: "int", nullable: false),
                    AccountUsername = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountEmail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountPasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountPasswordSalt = table.Column<byte[]>(type: "varbinary(max)", nullable: false),
                    AccountName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountLastname = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountPhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountCity = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountEmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    AccountEmailConfirmationPIN = table.Column<int>(type: "int", nullable: true),
                    AccountEmailVerifiedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AccountEmailConfirmationPINExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AccountLocked = table.Column<bool>(type: "bit", nullable: false),
                    AccountLockDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AccountFailPasswordCount = table.Column<int>(type: "int", nullable: false),
                    AccountLastFailedLoginDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AccountForgetPasswordPIN = table.Column<int>(type: "int", nullable: true),
                    AccountForgetPasswordPINExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AccountLastLoginDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AccountLastPasswordChangeDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AccountIsActive = table.Column<bool>(type: "bit", nullable: false),
                    AccountDeleted = table.Column<bool>(type: "bit", nullable: false),
                    AccountDeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AccountDeletedByID = table.Column<int>(type: "int", nullable: true),
                    AccountCreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AccountLanguage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountTimeZone = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Accounts", x => x.AccountID);
                    table.ForeignKey(
                        name: "FK_Accounts_AccountRoles_AccountRoleID",
                        column: x => x.AccountRoleID,
                        principalTable: "AccountRoles",
                        principalColumn: "AccountRoleID");
                    table.ForeignKey(
                        name: "FK_Accounts_Accounts_AccountDeletedByID",
                        column: x => x.AccountDeletedByID,
                        principalTable: "Accounts",
                        principalColumn: "AccountID");
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
                        principalColumn: "AccountID");
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
                        principalColumn: "CarsID");
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
                        principalColumn: "AccountID");
                    table.ForeignKey(
                        name: "FK_RentalBookings_Cars_CarID",
                        column: x => x.CarID,
                        principalTable: "Cars",
                        principalColumn: "CarsID");
                    table.ForeignKey(
                        name: "FK_RentalBookings_Tenants_TenantID",
                        column: x => x.TenantID,
                        principalTable: "Tenants",
                        principalColumn: "TenantID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_AccountDeletedByID",
                table: "Accounts",
                column: "AccountDeletedByID");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_AccountRoleID",
                table: "Accounts",
                column: "AccountRoleID");

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CarImages");

            migrationBuilder.DropTable(
                name: "RentalBookings");

            migrationBuilder.DropTable(
                name: "Cars");

            migrationBuilder.DropTable(
                name: "Accounts");

            migrationBuilder.DropTable(
                name: "Tenants");

            migrationBuilder.DropTable(
                name: "AccountRoles");
        }
    }
}
