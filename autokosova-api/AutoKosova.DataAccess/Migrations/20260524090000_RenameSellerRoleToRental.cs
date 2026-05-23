using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoKosova.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class RenameSellerRoleToRental : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE AccountRoles
                SET AccountRoleName = 'Rental',
                    AccountRoleDescription = 'Perdorues qe mund te shtoje dhe menaxhoje vetura me qira'
                WHERE AccountRoleName = 'Seller';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE AccountRoles
                SET AccountRoleName = 'Seller',
                    AccountRoleDescription = 'Perdorues qe mund te shtoje dhe menaxhoje veturat e veta'
                WHERE AccountRoleName = 'Rental';
            ");
        }
    }
}
