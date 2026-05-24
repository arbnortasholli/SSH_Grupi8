using AutoKosova.Business.Services;
using AutoKosova.Tests.Helpers;
using FluentAssertions;
using Microsoft.Extensions.Configuration;

namespace AutoKosova.Tests.Services;

public class RentalBookingServiceTests
{
    [Fact]
    public async Task Create_WhenBookingRequestIsValid_ReturnsSuccess()
    {
        using var db = new SqliteTestDbContext();
        var tenant = TestDataFactory.CreateTenant(1);
        var car = TestDataFactory.CreateRentalCar(id: 1, createdByAccountId: 2, tenantId: tenant.TenantID, dailyPrice: 50m);
        var role = TestDataFactory.CreateRole(1, "Customer");
        var ownerRole = TestDataFactory.CreateRole(2, "Seller");

        db.Context.AccountRoles.AddRange(role, ownerRole);
        db.Context.Accounts.AddRange(
            TestDataFactory.CreateAccount(2, 2, "owner2", "owner2@test.local", "Password123!", "Seller"),
            TestDataFactory.CreateAccount(9, 1, "customer9", "customer9@test.local", "Password123!", "Customer"));
        db.Context.Tenants.Add(tenant);
        db.Context.Cars.Add(car);
        await db.Context.SaveChangesAsync();

        var service = new RentalBookingService(db.Context, CreatePaymentService(db));
        var startDate = DateTime.UtcNow.Date.AddDays(2);
        var endDate = DateTime.UtcNow.Date.AddDays(5);

        var result = await service.Create(1, startDate, endDate, accountId: 9);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.TotalDays.Should().Be(3);
        result.Data.TotalPrice.Should().Be(150m);
    }

    [Fact]
    public async Task Create_WhenBookingConflicts_ReturnsBadRequest()
    {
        using var db = new SqliteTestDbContext();
        var tenant = TestDataFactory.CreateTenant(1);
        var car = TestDataFactory.CreateRentalCar(id: 1, createdByAccountId: 2, tenantId: tenant.TenantID, dailyPrice: 50m);
        var existingBooking = TestDataFactory.CreateBooking(
            id: 1,
            carId: 1,
            tenantId: 1,
            startDate: DateTime.UtcNow.Date.AddDays(3),
            endDate: DateTime.UtcNow.Date.AddDays(6),
            status: PaymentConstants.RentalStatusConfirmed);
        var customerRole = TestDataFactory.CreateRole(1, "Customer");
        var ownerRole = TestDataFactory.CreateRole(2, "Seller");

        db.Context.AccountRoles.AddRange(customerRole, ownerRole);
        db.Context.Accounts.AddRange(
            TestDataFactory.CreateAccount(2, 2, "owner2", "owner2@test.local", "Password123!", "Seller"),
            TestDataFactory.CreateAccount(9, 1, "customer9", "customer9@test.local", "Password123!", "Customer"),
            TestDataFactory.CreateAccount(10, 1, "customer10", "customer10@test.local", "Password123!", "Customer"));
        db.Context.Tenants.Add(tenant);
        db.Context.Cars.Add(car);
        db.Context.RentalBookings.Add(existingBooking);
        await db.Context.SaveChangesAsync();

        var service = new RentalBookingService(db.Context, CreatePaymentService(db));

        var result = await service.Create(1, DateTime.UtcNow.Date.AddDays(4), DateTime.UtcNow.Date.AddDays(7), accountId: 9);

        result.Status.Should().Be(ServiceStatus.BadRequest);
        result.Error.Should().Be("Car is not available for the selected dates.");
    }

    [Fact]
    public async Task UpdateStatus_WhenStatusIsInvalid_ReturnsBadRequest()
    {
        using var db = new SqliteTestDbContext();
        var service = new RentalBookingService(db.Context, CreatePaymentService(db));

        var result = await service.UpdateStatus(1, "UnknownStatus", 1, "SuperAdmin");

        result.Status.Should().Be(ServiceStatus.BadRequest);
        result.Error.Should().Be("Invalid booking status.");
    }

    [Fact]
    public async Task Delete_WhenBookingDoesNotExist_ReturnsNotFound()
    {
        using var db = new SqliteTestDbContext();
        var service = new RentalBookingService(db.Context, CreatePaymentService(db));

        var result = await service.Delete(999, 1, "SuperAdmin");

        result.Status.Should().Be(ServiceStatus.NotFound);
        result.Error.Should().Be("Rental booking not found.");
    }

    private static PaymentService CreatePaymentService(SqliteTestDbContext db)
    {
        var configuration = new ConfigurationBuilder().AddInMemoryCollection().Build();
        return new PaymentService(db.Context, new HttpClient(), configuration);
    }
}
