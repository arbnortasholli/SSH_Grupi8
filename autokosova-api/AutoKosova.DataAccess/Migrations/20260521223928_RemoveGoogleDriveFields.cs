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
            migrationBuilder.Sql(@"
IF COL_LENGTH('Cars', 'GoogleDriveFolderId') IS NOT NULL
BEGIN
    ALTER TABLE [Cars] DROP COLUMN [GoogleDriveFolderId];
END
");

            migrationBuilder.Sql(@"
IF COL_LENGTH('CarImages', 'GoogleDriveFileId') IS NOT NULL
BEGIN
    ALTER TABLE [CarImages] DROP COLUMN [GoogleDriveFileId];
END
");

            migrationBuilder.Sql(@"
IF COL_LENGTH('CarImages', 'CarImageContentType') IS NULL
BEGIN
    ALTER TABLE [CarImages] ADD [CarImageContentType] nvarchar(100) NULL;
END
");

            migrationBuilder.Sql(@"
IF COL_LENGTH('CarImages', 'CarImageOriginalFileName') IS NULL
BEGIN
    ALTER TABLE [CarImages] ADD [CarImageOriginalFileName] nvarchar(255) NULL;
END
");

            migrationBuilder.Sql(@"
IF COL_LENGTH('CarImages', 'CarImageSizeBytes') IS NULL
BEGIN
    ALTER TABLE [CarImages] ADD [CarImageSizeBytes] bigint NULL;
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF COL_LENGTH('CarImages', 'CarImageContentType') IS NOT NULL
BEGIN
    ALTER TABLE [CarImages] DROP COLUMN [CarImageContentType];
END
");

            migrationBuilder.Sql(@"
IF COL_LENGTH('CarImages', 'CarImageOriginalFileName') IS NOT NULL
BEGIN
    ALTER TABLE [CarImages] DROP COLUMN [CarImageOriginalFileName];
END
");

            migrationBuilder.Sql(@"
IF COL_LENGTH('CarImages', 'CarImageSizeBytes') IS NOT NULL
BEGIN
    ALTER TABLE [CarImages] DROP COLUMN [CarImageSizeBytes];
END
");
        }
    }
}
