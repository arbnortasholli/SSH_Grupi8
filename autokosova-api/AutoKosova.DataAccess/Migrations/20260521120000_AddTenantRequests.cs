using Microsoft.EntityFrameworkCore.Migrations;
using System;

#nullable disable

namespace AutoKosova.DataAccess.Migrations
{
    public partial class AddTenantRequests : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TenantRequests",
                columns: table => new
                {
                    TenantRequestID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountID = table.Column<int>(type: "int", nullable: false),
                    ReviewedByAccountID = table.Column<int>(type: "int", nullable: true),
                    CreatedTenantID = table.Column<int>(type: "int", nullable: true),
                    BusinessName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BusinessNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BusinessEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BusinessPhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BusinessCity = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BusinessAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AdminComment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantRequests", x => x.TenantRequestID);
                    table.ForeignKey(
                        name: "FK_TenantRequests_Accounts_AccountID",
                        column: x => x.AccountID,
                        principalTable: "Accounts",
                        principalColumn: "AccountID");
                    table.ForeignKey(
                        name: "FK_TenantRequests_Accounts_ReviewedByAccountID",
                        column: x => x.ReviewedByAccountID,
                        principalTable: "Accounts",
                        principalColumn: "AccountID");
                    table.ForeignKey(
                        name: "FK_TenantRequests_Tenants_CreatedTenantID",
                        column: x => x.CreatedTenantID,
                        principalTable: "Tenants",
                        principalColumn: "TenantID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_TenantRequests_AccountID",
                table: "TenantRequests",
                column: "AccountID");

            migrationBuilder.CreateIndex(
                name: "IX_TenantRequests_CreatedTenantID",
                table: "TenantRequests",
                column: "CreatedTenantID");

            migrationBuilder.CreateIndex(
                name: "IX_TenantRequests_ReviewedByAccountID",
                table: "TenantRequests",
                column: "ReviewedByAccountID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TenantRequests");
        }
    }
}
