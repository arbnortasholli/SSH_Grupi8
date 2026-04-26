using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoKosova.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddingAccountsToDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AccountsRole",
                columns: table => new
                {
                    AccountRoleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountRoleName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountRoleDescription = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountsRole", x => x.AccountRoleID);
                });

            migrationBuilder.CreateTable(
                name: "Accounts",
                columns: table => new
                {
                    AccountID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountUsername = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountEmail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountPassword = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountPasswordSalt = table.Column<byte[]>(type: "varbinary(max)", nullable: false),
                    AccountRoleID = table.Column<int>(type: "int", nullable: false),
                    AccountCreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AccountName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountLastname = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountPersonalNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountBirthDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AccountGender = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountPhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountPhoneConfirmationPIN = table.Column<int>(type: "int", nullable: false),
                    AccountIDImageFront = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountIDImageBack = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountSelfieImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountIDExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AccountKYCRejectReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountVerified = table.Column<bool>(type: "bit", nullable: false),
                    AccountVerifiedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AccountTwoFactorEnabled = table.Column<bool>(type: "bit", nullable: true),
                    AccountPrivateKey = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountLocked = table.Column<bool>(type: "bit", nullable: false),
                    AccountLockDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AccountFailPasswordCount = table.Column<int>(type: "int", nullable: false),
                    AccountLastFailedLoginDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AccountEmailConfirmationPIN = table.Column<int>(type: "int", nullable: false),
                    AccountEmailVerifiedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AccountEmailConfirmationPINExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AccountForgetPasswordPIN = table.Column<int>(type: "int", nullable: false),
                    AccountForgetPasswordPINExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AccountLastLoginDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AccountLastPasswordChangeDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AccountTermsAcceptedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AccountPrivacyPolicyAcceptedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AccountTermsVersion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountLanguage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountTimeZone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountDeleted = table.Column<bool>(type: "bit", nullable: false),
                    AccountDeletedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AccountDeletedByAccountID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Accounts", x => x.AccountID);
                    table.ForeignKey(
                        name: "FK_Accounts_AccountsRole_AccountRoleID",
                        column: x => x.AccountRoleID,
                        principalTable: "AccountsRole",
                        principalColumn: "AccountRoleID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Accounts_Accounts_AccountDeletedByAccountID",
                        column: x => x.AccountDeletedByAccountID,
                        principalTable: "Accounts",
                        principalColumn: "AccountID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_AccountDeletedByAccountID",
                table: "Accounts",
                column: "AccountDeletedByAccountID");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_AccountRoleID",
                table: "Accounts",
                column: "AccountRoleID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Accounts");

            migrationBuilder.DropTable(
                name: "AccountsRole");
        }
    }
}
