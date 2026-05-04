using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoKosova.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class InitDomain : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Accounts_AccountRoles_AccountRoleID",
                table: "Accounts");

            migrationBuilder.DropForeignKey(
                name: "FK_CarImages_Cars_CarID",
                table: "CarImages");

            migrationBuilder.DropForeignKey(
                name: "FK_Cars_Accounts_AccountID",
                table: "Cars");

            migrationBuilder.DropForeignKey(
                name: "FK_RentalBookings_Accounts_AccountID",
                table: "RentalBookings");

            migrationBuilder.DropIndex(
                name: "IX_RentalBookings_AccountID",
                table: "RentalBookings");

            migrationBuilder.DropIndex(
                name: "IX_Cars_AccountID",
                table: "Cars");

            migrationBuilder.DropColumn(
                name: "AccountID",
                table: "RentalBookings");

            migrationBuilder.DropColumn(
                name: "AccountID",
                table: "Cars");

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

            migrationBuilder.CreateIndex(
                name: "IX_Cars_CreatedByAccountID",
                table: "Cars",
                column: "CreatedByAccountID");

            migrationBuilder.CreateIndex(
                name: "IX_Cars_TenantID",
                table: "Cars",
                column: "TenantID");

            migrationBuilder.AddForeignKey(
                name: "FK_Accounts_AccountRoles_AccountRoleID",
                table: "Accounts",
                column: "AccountRoleID",
                principalTable: "AccountRoles",
                principalColumn: "AccountRoleID");

            migrationBuilder.AddForeignKey(
                name: "FK_CarImages_Cars_CarID",
                table: "CarImages",
                column: "CarID",
                principalTable: "Cars",
                principalColumn: "CarsID");

            migrationBuilder.AddForeignKey(
                name: "FK_Cars_Accounts_CreatedByAccountID",
                table: "Cars",
                column: "CreatedByAccountID",
                principalTable: "Accounts",
                principalColumn: "AccountID");

            migrationBuilder.AddForeignKey(
                name: "FK_Cars_Tenants_TenantID",
                table: "Cars",
                column: "TenantID",
                principalTable: "Tenants",
                principalColumn: "TenantID");

            migrationBuilder.AddForeignKey(
                name: "FK_RentalBookings_Accounts_CustomerAccountID",
                table: "RentalBookings",
                column: "CustomerAccountID",
                principalTable: "Accounts",
                principalColumn: "AccountID");

            migrationBuilder.AddForeignKey(
                name: "FK_RentalBookings_Cars_CarID",
                table: "RentalBookings",
                column: "CarID",
                principalTable: "Cars",
                principalColumn: "CarsID");

            migrationBuilder.AddForeignKey(
                name: "FK_RentalBookings_Tenants_TenantID",
                table: "RentalBookings",
                column: "TenantID",
                principalTable: "Tenants",
                principalColumn: "TenantID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Accounts_AccountRoles_AccountRoleID",
                table: "Accounts");

            migrationBuilder.DropForeignKey(
                name: "FK_CarImages_Cars_CarID",
                table: "CarImages");

            migrationBuilder.DropForeignKey(
                name: "FK_Cars_Accounts_CreatedByAccountID",
                table: "Cars");

            migrationBuilder.DropForeignKey(
                name: "FK_Cars_Tenants_TenantID",
                table: "Cars");

            migrationBuilder.DropForeignKey(
                name: "FK_RentalBookings_Accounts_CustomerAccountID",
                table: "RentalBookings");

            migrationBuilder.DropForeignKey(
                name: "FK_RentalBookings_Cars_CarID",
                table: "RentalBookings");

            migrationBuilder.DropForeignKey(
                name: "FK_RentalBookings_Tenants_TenantID",
                table: "RentalBookings");

            migrationBuilder.DropIndex(
                name: "IX_RentalBookings_CarID",
                table: "RentalBookings");

            migrationBuilder.DropIndex(
                name: "IX_RentalBookings_CustomerAccountID",
                table: "RentalBookings");

            migrationBuilder.DropIndex(
                name: "IX_RentalBookings_TenantID",
                table: "RentalBookings");

            migrationBuilder.DropIndex(
                name: "IX_Cars_CreatedByAccountID",
                table: "Cars");

            migrationBuilder.DropIndex(
                name: "IX_Cars_TenantID",
                table: "Cars");

            migrationBuilder.AddColumn<int>(
                name: "AccountID",
                table: "RentalBookings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AccountID",
                table: "Cars",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RentalBookings_AccountID",
                table: "RentalBookings",
                column: "AccountID");

            migrationBuilder.CreateIndex(
                name: "IX_Cars_AccountID",
                table: "Cars",
                column: "AccountID");

            migrationBuilder.AddForeignKey(
                name: "FK_Accounts_AccountRoles_AccountRoleID",
                table: "Accounts",
                column: "AccountRoleID",
                principalTable: "AccountRoles",
                principalColumn: "AccountRoleID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CarImages_Cars_CarID",
                table: "CarImages",
                column: "CarID",
                principalTable: "Cars",
                principalColumn: "CarsID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Cars_Accounts_AccountID",
                table: "Cars",
                column: "AccountID",
                principalTable: "Accounts",
                principalColumn: "AccountID");

            migrationBuilder.AddForeignKey(
                name: "FK_RentalBookings_Accounts_AccountID",
                table: "RentalBookings",
                column: "AccountID",
                principalTable: "Accounts",
                principalColumn: "AccountID");
        }
    }
}
