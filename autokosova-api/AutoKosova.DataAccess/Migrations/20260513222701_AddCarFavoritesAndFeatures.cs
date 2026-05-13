using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoKosova.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddCarFavoritesAndFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CarFeatures",
                columns: table => new
                {
                    CarFeatureID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CarFeatureName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CarFeatureDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CarFeatureIsActive = table.Column<bool>(type: "bit", nullable: false),
                    CarFeatureOrderNumber = table.Column<int>(type: "int", nullable: false),
                    CarFeatureCreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CarFeatureDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CarFeatureDeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarFeatures", x => x.CarFeatureID);
                });

            migrationBuilder.CreateTable(
                name: "CarFeatureMappings",
                columns: table => new
                {
                    CarFeatureMappingID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CarID = table.Column<int>(type: "int", nullable: false),
                    CarFeatureID = table.Column<int>(type: "int", nullable: false),
                    CarFeatureMappingCreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CarFeatureMappingDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CarFeatureMappingDeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarFeatureMappings", x => x.CarFeatureMappingID);
                    table.ForeignKey(
                        name: "FK_CarFeatureMappings_CarFeatures_CarFeatureID",
                        column: x => x.CarFeatureID,
                        principalTable: "CarFeatures",
                        principalColumn: "CarFeatureID");
                    table.ForeignKey(
                        name: "FK_CarFeatureMappings_Cars_CarID",
                        column: x => x.CarID,
                        principalTable: "Cars",
                        principalColumn: "CarsID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CarFeatureMappings_CarFeatureID",
                table: "CarFeatureMappings",
                column: "CarFeatureID");

            migrationBuilder.CreateIndex(
                name: "IX_CarFeatureMappings_CarID_CarFeatureID",
                table: "CarFeatureMappings",
                columns: new[] { "CarID", "CarFeatureID" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CarFeatureMappings");

            migrationBuilder.DropTable(
                name: "CarFeatures");
        }
    }
}
