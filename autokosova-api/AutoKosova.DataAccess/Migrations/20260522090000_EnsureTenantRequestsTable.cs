using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoKosova.DataAccess.Migrations
{
    public partial class EnsureTenantRequestsTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF OBJECT_ID(N'[TenantRequests]', N'U') IS NULL
BEGIN
    CREATE TABLE [TenantRequests] (
        [TenantRequestID] int NOT NULL IDENTITY,
        [AccountID] int NOT NULL,
        [ReviewedByAccountID] int NULL,
        [CreatedTenantID] int NULL,
        [BusinessName] nvarchar(max) NOT NULL,
        [BusinessNumber] nvarchar(max) NULL,
        [BusinessEmail] nvarchar(max) NULL,
        [BusinessPhoneNumber] nvarchar(max) NULL,
        [BusinessCity] nvarchar(max) NULL,
        [BusinessAddress] nvarchar(max) NULL,
        [Message] nvarchar(max) NULL,
        [Status] nvarchar(max) NOT NULL,
        [AdminComment] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [ReviewedAt] datetime2 NULL,
        CONSTRAINT [PK_TenantRequests] PRIMARY KEY ([TenantRequestID]),
        CONSTRAINT [FK_TenantRequests_Accounts_AccountID] FOREIGN KEY ([AccountID]) REFERENCES [Accounts] ([AccountID]),
        CONSTRAINT [FK_TenantRequests_Accounts_ReviewedByAccountID] FOREIGN KEY ([ReviewedByAccountID]) REFERENCES [Accounts] ([AccountID]),
        CONSTRAINT [FK_TenantRequests_Tenants_CreatedTenantID] FOREIGN KEY ([CreatedTenantID]) REFERENCES [Tenants] ([TenantID])
    );

    CREATE INDEX [IX_TenantRequests_AccountID] ON [TenantRequests] ([AccountID]);
    CREATE INDEX [IX_TenantRequests_CreatedTenantID] ON [TenantRequests] ([CreatedTenantID]);
    CREATE INDEX [IX_TenantRequests_ReviewedByAccountID] ON [TenantRequests] ([ReviewedByAccountID]);
END
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF OBJECT_ID(N'[TenantRequests]', N'U') IS NOT NULL
BEGIN
    DROP TABLE [TenantRequests];
END
");
        }
    }
}
