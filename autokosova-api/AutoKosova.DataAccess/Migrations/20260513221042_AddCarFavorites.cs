using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoKosova.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddCarFavorites : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CarFavorites",
                columns: table => new
                {
                    CarFavoriteID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountID = table.Column<int>(type: "int", nullable: false),
                    CarID = table.Column<int>(type: "int", nullable: false),
                    CarFavoriteCreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CarFavoriteDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CarFavoriteDeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarFavorites", x => x.CarFavoriteID);
                    table.ForeignKey(
                        name: "FK_CarFavorites_Accounts_AccountID",
                        column: x => x.AccountID,
                        principalTable: "Accounts",
                        principalColumn: "AccountID");
                    table.ForeignKey(
                        name: "FK_CarFavorites_Cars_CarID",
                        column: x => x.CarID,
                        principalTable: "Cars",
                        principalColumn: "CarsID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CarFavorites_AccountID_CarID",
                table: "CarFavorites",
                columns: new[] { "AccountID", "CarID" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CarFavorites_CarID",
                table: "CarFavorites",
                column: "CarID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CarFavorites");
        }
    }
}
