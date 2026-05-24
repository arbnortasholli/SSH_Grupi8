using AutoKosova.Business.DTOs.Tenants;
using AutoKosova.Business.Services;
using AutoKosova.Entity;
using Microsoft.Extensions.Configuration;

namespace AutoKosova.Tests.Helpers;

public static class TestDataFactory
{
    public static AccountRole CreateRole(int id, string name) => new()
    {
        AccountRoleID = id,
        AccountRoleName = name,
    };

    public static Tenant CreateTenant(int id = 1, string name = "Tenant One", int? ownerAccountId = null) => new()
    {
        TenantID = id,
        TenantName = name,
        OwnerAccountID = ownerAccountId,
        TenantIsActive = true,
        TenantCreationDate = DateTime.UtcNow,
    };

    public static Account CreateAccount(
        int id,
        int roleId,
        string username,
        string email,
        string password,
        string roleName = "Customer",
        int? tenantId = null,
        bool isActive = true,
        bool isDeleted = false,
        bool isLocked = false)
    {
        var passwordService = new PasswordService();
        passwordService.CreatePasswordHash(password, out var passwordHash, out var passwordSalt);

        return new Account
        {
            AccountID = id,
            AccountRoleID = roleId,
            TenantID = tenantId,
            AccountUsername = username,
            AccountEmail = email,
            AccountPasswordHash = passwordHash,
            AccountPasswordSalt = passwordSalt,
            AccountName = "Test",
            AccountLastname = "User",
            AccountIsActive = isActive,
            AccountDeleted = isDeleted,
            AccountLocked = isLocked,
            AccountCreationDate = DateTime.UtcNow,
        };
    }

    public static Cars CreateRentalCar(
        int id = 1,
        int createdByAccountId = 1,
        int? tenantId = 1,
        string status = "Available",
        decimal dailyPrice = 45m) => new()
    {
        CarsID = id,
        CreatedByAccountID = createdByAccountId,
        TenantID = tenantId,
        CarTitle = "2022 BMW X5",
        CarBrand = "BMW",
        CarModel = "X5",
        CarYear = 2022,
        CarMileage = 50000,
        CarFuelType = "Diesel",
        CarTransmission = "Automatic",
        CarBodyType = "SUV",
        CarDescription = "Test rental car",
        IsForSale = false,
        IsForRent = true,
        RentalDailyPrice = dailyPrice,
        CarStatus = status,
        CarCreationDate = DateTime.UtcNow,
    };

    public static Cars CreateSaleCar(
        int id = 2,
        int createdByAccountId = 1,
        string status = "Available",
        decimal salePrice = 12000m) => new()
    {
        CarsID = id,
        CreatedByAccountID = createdByAccountId,
        CarTitle = "2021 Audi A4",
        CarBrand = "Audi",
        CarModel = "A4",
        CarYear = 2021,
        CarMileage = 70000,
        CarFuelType = "Diesel",
        CarTransmission = "Automatic",
        CarBodyType = "Sedan",
        CarDescription = "Test sale car",
        IsForSale = true,
        IsForRent = false,
        SalePrice = salePrice,
        CarStatus = status,
        CarCreationDate = DateTime.UtcNow,
    };

    public static RentalBooking CreateBooking(
        int id = 1,
        int carId = 1,
        int tenantId = 1,
        int customerAccountId = 10,
        DateTime? startDate = null,
        DateTime? endDate = null,
        string status = PaymentConstants.RentalStatusPendingPayment)
    {
        var start = (startDate ?? DateTime.UtcNow.Date.AddDays(2)).Date;
        var end = (endDate ?? DateTime.UtcNow.Date.AddDays(5)).Date;

        return new RentalBooking
        {
            RentalBookingID = id,
            CarID = carId,
            TenantID = tenantId,
            CustomerAccountID = customerAccountId,
            RentalBookingStartDate = start,
            RentalBookingEndDate = end,
            RentalBookingDailyPrice = 40m,
            RentalBookingTotalPrice = 120m,
            RentalBookingStatus = status,
            RentalBookingCreationDate = DateTime.UtcNow,
        };
    }

    public static Permission CreatePermission(int id, string name) => new()
    {
        PermissionID = id,
        PermissionName = name,
        PersmissionIsActive = true,
    };

    public static TenantCreateRequestDto CreateTenantRequest(string? name = "Tenant One") => new()
    {
        TenantName = name ?? string.Empty,
        TenantBusinessNumber = "BN-001",
        TenantEmail = "tenant@example.com",
        TenantPhoneNumber = "+38344111222",
        TenantCity = "Prishtine",
        TenantAddress = "Main street",
        TenantIsActive = true,
    };

    public static IConfiguration CreateJwtConfiguration() =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "super-secret-test-key-with-sufficient-length",
                ["Jwt:Issuer"] = "AutoKosova.Tests",
                ["Jwt:Audience"] = "AutoKosova.Tests.Client",
                ["Jwt:ExpireMinutes"] = "60",
            })
            .Build();
}
