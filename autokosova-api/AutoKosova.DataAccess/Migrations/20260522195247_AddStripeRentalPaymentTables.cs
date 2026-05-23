using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AutoKosova.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddStripeRentalPaymentTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "RentalBookingStatus",
                table: "RentalBookings",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateTable(
                name: "PaymentStatuses",
                columns: table => new
                {
                    PaymentStatusID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PaymentStatusName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PaymentStatusDescription = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentStatuses", x => x.PaymentStatusID);
                });

            migrationBuilder.CreateTable(
                name: "RentalBookingStatuses",
                columns: table => new
                {
                    RentalBookingStatusID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RentalBookingStatusName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RentalBookingStatusDescription = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RentalBookingStatuses", x => x.RentalBookingStatusID);
                });

            migrationBuilder.CreateTable(
                name: "PaymentOrders",
                columns: table => new
                {
                    PaymentOrderID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountID = table.Column<int>(type: "int", nullable: false),
                    RentalBookingID = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    PaymentStatusID = table.Column<int>(type: "int", nullable: false),
                    PaymentProvider = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StripeCheckoutSessionID = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    StripePaymentIntentID = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PaidDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FailedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CancelledDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentOrders", x => x.PaymentOrderID);
                    table.ForeignKey(
                        name: "FK_PaymentOrders_Accounts_AccountID",
                        column: x => x.AccountID,
                        principalTable: "Accounts",
                        principalColumn: "AccountID");
                    table.ForeignKey(
                        name: "FK_PaymentOrders_PaymentStatuses_PaymentStatusID",
                        column: x => x.PaymentStatusID,
                        principalTable: "PaymentStatuses",
                        principalColumn: "PaymentStatusID");
                    table.ForeignKey(
                        name: "FK_PaymentOrders_RentalBookings_RentalBookingID",
                        column: x => x.RentalBookingID,
                        principalTable: "RentalBookings",
                        principalColumn: "RentalBookingID");
                });

            migrationBuilder.CreateTable(
                name: "PaymentEvents",
                columns: table => new
                {
                    PaymentEventID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StripeEventID = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StripeCheckoutSessionID = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    StripePaymentIntentID = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    PaymentOrderID = table.Column<int>(type: "int", nullable: true),
                    Payload = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReceivedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProcessedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentEvents", x => x.PaymentEventID);
                    table.ForeignKey(
                        name: "FK_PaymentEvents_PaymentOrders_PaymentOrderID",
                        column: x => x.PaymentOrderID,
                        principalTable: "PaymentOrders",
                        principalColumn: "PaymentOrderID");
                });

            migrationBuilder.InsertData(
                table: "PaymentStatuses",
                columns: new[] { "PaymentStatusID", "PaymentStatusDescription", "PaymentStatusName" },
                values: new object[,]
                {
                    { 1, "Payment is waiting to be completed.", "Pending" },
                    { 2, "Payment was completed successfully.", "Paid" },
                    { 3, "Payment failed.", "Failed" },
                    { 4, "Payment was cancelled.", "Cancelled" },
                    { 5, "Payment was refunded.", "Refunded" }
                });

            migrationBuilder.InsertData(
                table: "RentalBookingStatuses",
                columns: new[] { "RentalBookingStatusID", "RentalBookingStatusDescription", "RentalBookingStatusName" },
                values: new object[,]
                {
                    { 1, "Booking is waiting for payment.", "PendingPayment" },
                    { 2, "Booking payment is confirmed.", "Confirmed" },
                    { 3, "Booking has been cancelled.", "Cancelled" },
                    { 4, "Booking has been completed.", "Completed" }
                });

            migrationBuilder.Sql("UPDATE RentalBookings SET RentalBookingStatus = 'PendingPayment' WHERE RentalBookingStatus = 'Pending'");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentEvents_PaymentOrderID",
                table: "PaymentEvents",
                column: "PaymentOrderID");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentEvents_StripeEventID",
                table: "PaymentEvents",
                column: "StripeEventID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentOrders_AccountID",
                table: "PaymentOrders",
                column: "AccountID");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentOrders_PaymentStatusID",
                table: "PaymentOrders",
                column: "PaymentStatusID");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentOrders_RentalBookingID",
                table: "PaymentOrders",
                column: "RentalBookingID");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentStatuses_PaymentStatusName",
                table: "PaymentStatuses",
                column: "PaymentStatusName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RentalBookingStatuses_RentalBookingStatusName",
                table: "RentalBookingStatuses",
                column: "RentalBookingStatusName",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PaymentEvents");

            migrationBuilder.DropTable(
                name: "RentalBookingStatuses");

            migrationBuilder.DropTable(
                name: "PaymentOrders");

            migrationBuilder.DropTable(
                name: "PaymentStatuses");

            migrationBuilder.Sql("UPDATE RentalBookings SET RentalBookingStatus = 'Pending' WHERE RentalBookingStatus = 'PendingPayment'");

            migrationBuilder.AlterColumn<string>(
                name: "RentalBookingStatus",
                table: "RentalBookings",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);
        }
    }
}
