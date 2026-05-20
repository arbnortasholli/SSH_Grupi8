using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoKosova.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountTenantLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OwnerAccountID",
                table: "Tenants",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TenantID",
                table: "Accounts",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_OwnerAccountID",
                table: "Tenants",
                column: "OwnerAccountID");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_TenantID",
                table: "Accounts",
                column: "TenantID");

            migrationBuilder.AddForeignKey(
                name: "FK_Accounts_Tenants_TenantID",
                table: "Accounts",
                column: "TenantID",
                principalTable: "Tenants",
                principalColumn: "TenantID");

            migrationBuilder.AddForeignKey(
                name: "FK_Tenants_Accounts_OwnerAccountID",
                table: "Tenants",
                column: "OwnerAccountID",
                principalTable: "Accounts",
                principalColumn: "AccountID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Accounts_Tenants_TenantID",
                table: "Accounts");

            migrationBuilder.DropForeignKey(
                name: "FK_Tenants_Accounts_OwnerAccountID",
                table: "Tenants");

            migrationBuilder.DropIndex(
                name: "IX_Tenants_OwnerAccountID",
                table: "Tenants");

            migrationBuilder.DropIndex(
                name: "IX_Accounts_TenantID",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "OwnerAccountID",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "TenantID",
                table: "Accounts");
        }
    }
}
