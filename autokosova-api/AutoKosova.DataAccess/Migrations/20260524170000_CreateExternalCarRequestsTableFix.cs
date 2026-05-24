using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoKosova.DataAccess.Migrations
{
    /// <inheritdoc />
    [Migration("20260524170000_CreateExternalCarRequestsTableFix")]
    public partial class CreateExternalCarRequestsTableFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[ExternalCarRequests]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [ExternalCarRequests] (
                        [ExternalCarRequestID] int NOT NULL IDENTITY,
                        [AccountID] int NOT NULL,
                        [ReviewedByAccountID] int NULL,
                        [ExternalCarID] nvarchar(120) NOT NULL,
                        [Source] nvarchar(50) NOT NULL,
                        [CarName] nvarchar(255) NOT NULL,
                        [Brand] nvarchar(100) NULL,
                        [Model] nvarchar(100) NULL,
                        [Year] int NULL,
                        [Price] decimal(18,2) NULL,
                        [Currency] nvarchar(10) NULL,
                        [Mileage] int NULL,
                        [ImageUrl] nvarchar(max) NULL,
                        [DetailUrl] nvarchar(max) NULL,
                        [CustomerName] nvarchar(max) NULL,
                        [CustomerEmail] nvarchar(255) NULL,
                        [CustomerPhone] nvarchar(50) NULL,
                        [Message] nvarchar(max) NULL,
                        [Status] nvarchar(50) NOT NULL,
                        [AdminComment] nvarchar(max) NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        [ReviewedAt] datetime2 NULL,
                        CONSTRAINT [PK_ExternalCarRequests] PRIMARY KEY ([ExternalCarRequestID]),
                        CONSTRAINT [FK_ExternalCarRequests_Accounts_AccountID] FOREIGN KEY ([AccountID]) REFERENCES [Accounts] ([AccountID]),
                        CONSTRAINT [FK_ExternalCarRequests_Accounts_ReviewedByAccountID] FOREIGN KEY ([ReviewedByAccountID]) REFERENCES [Accounts] ([AccountID])
                    );

                    CREATE INDEX [IX_ExternalCarRequests_AccountID] ON [ExternalCarRequests] ([AccountID]);
                    CREATE INDEX [IX_ExternalCarRequests_ReviewedByAccountID] ON [ExternalCarRequests] ([ReviewedByAccountID]);
                END
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[ExternalCarRequests]', N'U') IS NOT NULL
                BEGIN
                    DROP TABLE [ExternalCarRequests];
                END
                """);
        }
    }
}
