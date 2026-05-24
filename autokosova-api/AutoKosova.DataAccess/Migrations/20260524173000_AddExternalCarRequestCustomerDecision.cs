using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoKosova.DataAccess.Migrations
{
    /// <inheritdoc />
    [Migration("20260524173000_AddExternalCarRequestCustomerDecision")]
    public partial class AddExternalCarRequestCustomerDecision : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[ExternalCarRequests]', N'U') IS NOT NULL
                BEGIN
                    IF COL_LENGTH(N'[ExternalCarRequests]', N'CustomerDecision') IS NULL
                    BEGIN
                        ALTER TABLE [ExternalCarRequests]
                        ADD [CustomerDecision] nvarchar(50) NOT NULL CONSTRAINT [DF_ExternalCarRequests_CustomerDecision] DEFAULT N'Pending';
                    END

                    IF COL_LENGTH(N'[ExternalCarRequests]', N'CustomerDecisionAt') IS NULL
                    BEGIN
                        ALTER TABLE [ExternalCarRequests]
                        ADD [CustomerDecisionAt] datetime2 NULL;
                    END
                END
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[ExternalCarRequests]', N'U') IS NOT NULL
                BEGIN
                    IF COL_LENGTH(N'[ExternalCarRequests]', N'CustomerDecisionAt') IS NOT NULL
                    BEGIN
                        ALTER TABLE [ExternalCarRequests] DROP COLUMN [CustomerDecisionAt];
                    END

                    IF COL_LENGTH(N'[ExternalCarRequests]', N'CustomerDecision') IS NOT NULL
                    BEGIN
                        DECLARE @constraintName nvarchar(200);
                        SELECT @constraintName = [name]
                        FROM sys.default_constraints
                        WHERE parent_object_id = OBJECT_ID(N'[ExternalCarRequests]')
                          AND parent_column_id = COLUMNPROPERTY(OBJECT_ID(N'[ExternalCarRequests]'), N'CustomerDecision', 'ColumnId');

                        IF @constraintName IS NOT NULL
                        BEGIN
                            EXEC(N'ALTER TABLE [ExternalCarRequests] DROP CONSTRAINT [' + @constraintName + N']');
                        END

                        ALTER TABLE [ExternalCarRequests] DROP COLUMN [CustomerDecision];
                    END
                END
                """);
        }
    }
}
