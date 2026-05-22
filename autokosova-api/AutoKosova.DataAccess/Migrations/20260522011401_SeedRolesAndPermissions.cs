using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoKosova.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class SeedRolesAndPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Seed Roles
            migrationBuilder.InsertData(
                table: "AccountRoles",
                columns: new[] { "AccountRoleName", "AccountRoleDescription" },
                values: new object[,]
                {
                    { "SuperAdmin", "Administrator me qasje te plote" },
                    { "Seller", "Perdorues qe mund te shtoje dhe menaxhoje veturat e veta" },
                    { "Customer", "Klient qe mund te shikoje dhe rezervoje vetura" }
                });

            // Seed Permissions
            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "PermissionName", "PermissionDescription", "PermissionGroup", "PersmissionIsActive" },
                values: new object[,]
                {
                    { "Cars.Create", "Mundesia per te shtuar vetura te reja", "Cars", true },
                    { "Cars.Update", "Mundesia per te perditesuar veturat", "Cars", true },
                    { "Cars.Delete", "Mundesia per te fshire veturat", "Cars", true },
                    { "Cars.Images.Manage", "Mundesia per te menaxhuar imazhet e veturave", "Cars", true },
                    { "CarFeatures.Manage", "Mundesia per te menaxhuar karakteristikat e veturave", "Cars", true }
                });

            // Seed AccountRolePermissions for Seller
            // Note: We use SQL subqueries to get IDs since they are identity columns
            migrationBuilder.Sql(@"
                DECLARE @SellerRoleId INT = (SELECT TOP 1 AccountRoleID FROM AccountRoles WHERE AccountRoleName = 'Seller');
                
                INSERT INTO AccountRolePermissions (AccountRoleID, PermissionID, AccountRolePermissionCreatedAt)
                SELECT @SellerRoleId, PermissionID, GETUTCDATE()
                FROM Permissions 
                WHERE PermissionName IN ('Cars.Create', 'Cars.Update', 'Cars.Delete', 'Cars.Images.Manage', 'CarFeatures.Manage');
            ");
            
            // Seed AccountRolePermissions for SuperAdmin
            migrationBuilder.Sql(@"
                DECLARE @AdminRoleId INT = (SELECT TOP 1 AccountRoleID FROM AccountRoles WHERE AccountRoleName = 'SuperAdmin');
                
                INSERT INTO AccountRolePermissions (AccountRoleID, PermissionID, AccountRolePermissionCreatedAt)
                SELECT @AdminRoleId, PermissionID, GETUTCDATE()
                FROM Permissions;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM AccountRolePermissions");
            migrationBuilder.Sql("DELETE FROM Permissions");
            migrationBuilder.Sql("DELETE FROM AccountRoles");
        }
    }
}
