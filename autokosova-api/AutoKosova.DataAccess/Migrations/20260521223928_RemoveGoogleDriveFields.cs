using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoKosova.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class RemoveGoogleDriveFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GoogleDriveFolderId",
                table: "Cars");

            migrationBuilder.DropColumn(
                name: "GoogleDriveFileId",
                table: "CarImages");

            if (System.Environment.GetEnvironmentVariable("EF_IGNORE_EXISTING_COLUMNS") != "true")
            {
                migrationBuilder.AddColumn<string>(
                    name: "CarImageContentType",
                    table: "CarImages",
                    type: "nvarchar(100)",
                    maxLength: 100,
                    nullable: true);

                migrationBuilder.AddColumn<string>(
                    name: "CarImageOriginalFileName",
                    table: "CarImages",
                    type: "nvarchar(255)",
                    maxLength: 255,
                    nullable: true);

                migrationBuilder.AddColumn<long>(
                    name: "CarImageSizeBytes",
                    table: "CarImages",
                    type: "bigint",
                    nullable: true);
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CarImageContentType",
                table: "CarImages");

            migrationBuilder.DropColumn(
                name: "CarImageOriginalFileName",
                table: "CarImages");

            migrationBuilder.DropColumn(
                name: "CarImageSizeBytes",
                table: "CarImages");
        }
    }
}
