using AutoKosova.Business.Services;
using AutoKosova.Tests.Helpers;
using FluentAssertions;
using Moq;

namespace AutoKosova.Tests.Services;

public class CarServiceTests
{
    [Fact]
    public async Task Create_WhenCarIsValidRental_ReturnsSuccess()
    {
        using var db = new SqliteTestDbContext();
        db.Context.AccountRoles.Add(TestDataFactory.CreateRole(1, "Seller"));
        db.Context.Accounts.Add(TestDataFactory.CreateAccount(7, 1, "seller7", "seller7@test.local", "Password123!", "Seller"));
        db.Context.Tenants.Add(TestDataFactory.CreateTenant(1));
        await db.Context.SaveChangesAsync();

        var service = new CarService(db.Context, CreateLocalImageStorageService());
        var car = TestDataFactory.CreateRentalCar();

        var result = await service.Create(car, accountId: 7, role: "Rental", currentTenantId: 1);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.CreatedByAccountID.Should().Be(7);
        result.Data.SalePrice.Should().BeNull();
    }

    [Fact]
    public async Task Create_WhenListingTypeIsInvalid_ReturnsBadRequest()
    {
        using var db = new SqliteTestDbContext();
        var service = new CarService(db.Context, CreateLocalImageStorageService());
        var car = TestDataFactory.CreateRentalCar();
        car.IsForSale = true;
        car.SalePrice = 10000m;

        var result = await service.Create(car, accountId: 7, role: "Rental", currentTenantId: 1);

        result.IsSuccess.Should().BeFalse();
        result.Status.Should().Be(ServiceStatus.BadRequest);
        result.Error.Should().Be("A car cannot be both for sale and for rent.");
    }

    [Fact]
    public async Task GetAll_WhenSellerHasCars_ReturnsOnlySaleCarsCreatedBySeller()
    {
        using var db = new SqliteTestDbContext();
        db.Context.AccountRoles.Add(TestDataFactory.CreateRole(1, "Seller"));
        db.Context.Accounts.AddRange(
            TestDataFactory.CreateAccount(7, 1, "seller7", "seller7@test.local", "Password123!", "Seller", tenantId: 1),
            TestDataFactory.CreateAccount(8, 1, "seller8", "seller8@test.local", "Password123!", "Seller", tenantId: 1));
        db.Context.Tenants.Add(TestDataFactory.CreateTenant(1));
        db.Context.Cars.AddRange(
            TestDataFactory.CreateSaleCar(id: 1, createdByAccountId: 7),
            TestDataFactory.CreateSaleCar(id: 2, createdByAccountId: 8),
            TestDataFactory.CreateRentalCar(id: 3, createdByAccountId: 7, tenantId: 1));
        await db.Context.SaveChangesAsync();

        var service = new CarService(db.Context, CreateLocalImageStorageService());

        var cars = await service.GetAll(accountId: 7, role: "Seller", tenantId: 1);

        cars.Should().ContainSingle();
        cars[0].CreatedByAccountID.Should().Be(7);
        cars[0].IsForSale.Should().BeTrue();
    }

    [Fact]
    public async Task Update_WhenCarDoesNotExist_ReturnsNotFound()
    {
        using var db = new SqliteTestDbContext();
        var service = new CarService(db.Context, CreateLocalImageStorageService());

        var result = await service.Update(999, TestDataFactory.CreateRentalCar(), 1, "SuperAdmin", currentTenantId: null);

        result.Status.Should().Be(ServiceStatus.NotFound);
        result.Error.Should().Be("Car not found.");
    }

    [Fact]
    public async Task Delete_WhenUserDoesNotOwnCar_ReturnsForbidden()
    {
        using var db = new SqliteTestDbContext();
        db.Context.AccountRoles.Add(TestDataFactory.CreateRole(1, "Seller"));
        db.Context.Accounts.AddRange(
            TestDataFactory.CreateAccount(2, 1, "owner", "owner@test.local", "Password123!", "Seller"),
            TestDataFactory.CreateAccount(99, 1, "other", "other@test.local", "Password123!", "Customer"));
        db.Context.Tenants.Add(TestDataFactory.CreateTenant(1));
        db.Context.Cars.Add(TestDataFactory.CreateRentalCar(createdByAccountId: 2));
        await db.Context.SaveChangesAsync();

        var service = new CarService(db.Context, CreateLocalImageStorageService());

        var result = await service.Delete(1, accountId: 99, role: "Customer", currentTenantId: null);

        result.Status.Should().Be(ServiceStatus.Forbidden);
        result.Error.Should().Be("You can delete only cars that belong to your tenant.");
    }

    [Fact]
    public async Task GetById_WhenCarDoesNotExist_ReturnsNotFound()
    {
        using var db = new SqliteTestDbContext();
        var service = new CarService(db.Context, CreateLocalImageStorageService());

        var result = await service.GetById(404);

        result.Status.Should().Be(ServiceStatus.NotFound);
        result.Error.Should().Be("Car not found.");
    }

    private static LocalImageStorageService CreateLocalImageStorageService()
    {
        var environment = new Mock<Microsoft.AspNetCore.Hosting.IWebHostEnvironment>();
        environment.SetupGet(x => x.WebRootPath).Returns(Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString("N")));
        return new LocalImageStorageService(environment.Object);
    }
}
