using AutoKosova.Business.Services;
using AutoKosova.DataAccess;
using AutoKosova.Entity;

namespace AutoKosova.ApiTests.Infrastructure;

public static class TestDataSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (context.AccountRoles.Any())
        {
            return;
        }

        var passwordService = new PasswordService();

        var adminRole = new AccountRole { AccountRoleID = 1, AccountRoleName = "SuperAdmin" };
        var sellerRole = new AccountRole { AccountRoleID = 2, AccountRoleName = "Seller" };
        var customerRole = new AccountRole { AccountRoleID = 3, AccountRoleName = "Customer" };
        var viewerRole = new AccountRole { AccountRoleID = 4, AccountRoleName = "Viewer" };

        context.AccountRoles.AddRange(adminRole, sellerRole, customerRole, viewerRole);

        var tenant = new Tenant
        {
            TenantID = 1,
            TenantName = "AutoKosova Rentals",
            TenantIsActive = true,
            TenantCreationDate = DateTime.UtcNow,
        };
        context.Tenants.Add(tenant);
        await context.SaveChangesAsync();

        var admin = CreateAccount(passwordService, 1, 1, "admin", "admin@test.local", "Admin123!", "System", "Admin");
        var seller = CreateAccount(passwordService, 100, 2, "seller", "seller@test.local", "Seller123!", "Rental", "Owner", tenantId: 1);
        var customer = CreateAccount(passwordService, 200, 3, "customer", "customer@test.local", "Customer123!", "Car", "Buyer");
        var viewer = CreateAccount(passwordService, 300, 4, "viewer", "viewer@test.local", "Viewer123!", "Read", "Only");

        context.Accounts.AddRange(admin, seller, customer, viewer);
        await context.SaveChangesAsync();

        tenant.OwnerAccountID = seller.AccountID;
        await context.SaveChangesAsync();

        var permissions = new[]
        {
            new Permission { PermissionID = 1, PermissionName = "Cars.Create", PersmissionIsActive = true },
            new Permission { PermissionID = 2, PermissionName = "Cars.Update", PersmissionIsActive = true },
            new Permission { PermissionID = 3, PermissionName = "Cars.Delete", PersmissionIsActive = true },
            new Permission { PermissionID = 4, PermissionName = "Tenants.View", PersmissionIsActive = true },
            new Permission { PermissionID = 5, PermissionName = "Tenants.Create", PersmissionIsActive = true },
            new Permission { PermissionID = 6, PermissionName = "Tenants.Update", PersmissionIsActive = true },
            new Permission { PermissionID = 7, PermissionName = "Tenants.Delete", PersmissionIsActive = true },
            new Permission { PermissionID = 8, PermissionName = "RentalBookings.View", PersmissionIsActive = true },
            new Permission { PermissionID = 9, PermissionName = "RentalBookings.ViewByTenant", PersmissionIsActive = true },
            new Permission { PermissionID = 10, PermissionName = "RentalBookings.UpdateStatus", PersmissionIsActive = true },
        };

        context.Permissions.AddRange(permissions);
        context.AccountRolePermissions.AddRange(new[]
        {
            new AccountRolePermission { AccountRolePermissionID = 1, AccountRoleID = 2, PermissionID = 1 },
            new AccountRolePermission { AccountRolePermissionID = 2, AccountRoleID = 2, PermissionID = 2 },
            new AccountRolePermission { AccountRolePermissionID = 3, AccountRoleID = 2, PermissionID = 3 },
            new AccountRolePermission { AccountRolePermissionID = 4, AccountRoleID = 2, PermissionID = 4 },
            new AccountRolePermission { AccountRolePermissionID = 5, AccountRoleID = 2, PermissionID = 5 },
            new AccountRolePermission { AccountRolePermissionID = 6, AccountRoleID = 2, PermissionID = 6 },
            new AccountRolePermission { AccountRolePermissionID = 7, AccountRoleID = 2, PermissionID = 7 },
            new AccountRolePermission { AccountRolePermissionID = 8, AccountRoleID = 2, PermissionID = 8 },
            new AccountRolePermission { AccountRolePermissionID = 9, AccountRoleID = 2, PermissionID = 9 },
            new AccountRolePermission { AccountRolePermissionID = 10, AccountRoleID = 2, PermissionID = 10 },
        });

        var saleCar = new Cars
        {
            CarsID = 1,
            TenantID = 1,
            CreatedByAccountID = 100,
            CarTitle = "2021 Audi A4",
            CarBrand = "Audi",
            CarModel = "A4",
            CarYear = 2021,
            CarMileage = 60000,
            CarFuelType = "Diesel",
            CarTransmission = "Automatic",
            CarBodyType = "Sedan",
            CarColor = "Black",
            CarDescription = "Seed sale car",
            IsForSale = true,
            SalePrice = 18000m,
            IsForRent = false,
            CarStatus = "Available",
            CarCreationDate = DateTime.UtcNow,
        };

        var rentCar = new Cars
        {
            CarsID = 2,
            TenantID = 1,
            CreatedByAccountID = 100,
            CarTitle = "2022 BMW X5",
            CarBrand = "BMW",
            CarModel = "X5",
            CarYear = 2022,
            CarMileage = 45000,
            CarFuelType = "Diesel",
            CarTransmission = "Automatic",
            CarBodyType = "SUV",
            CarColor = "White",
            CarDescription = "Seed rental car",
            IsForSale = false,
            IsForRent = true,
            RentalDailyPrice = 55m,
            CarStatus = "Available",
            CarCreationDate = DateTime.UtcNow,
        };

        saleCar.CarImages.Add(new CarImage
        {
            CarImageID = 1,
            CarID = 1,
            CarImageUrl = "/uploads/cars/1/main.jpg",
            CarImageIsMain = true,
            CarImageOrderNumber = 1,
            CarImageDeleted = false,
        });

        context.Cars.AddRange(saleCar, rentCar);

        context.RentalBookings.Add(new RentalBooking
        {
            RentalBookingID = 1,
            TenantID = 1,
            CarID = 2,
            CustomerAccountID = 200,
            RentalBookingStartDate = DateTime.UtcNow.Date.AddDays(3),
            RentalBookingEndDate = DateTime.UtcNow.Date.AddDays(6),
            RentalBookingDailyPrice = 55m,
            RentalBookingTotalPrice = 165m,
            RentalBookingStatus = PaymentConstants.RentalStatusConfirmed,
            RentalBookingCreationDate = DateTime.UtcNow,
        });

        await context.SaveChangesAsync();
    }

    private static Account CreateAccount(
        PasswordService passwordService,
        int id,
        int roleId,
        string username,
        string email,
        string password,
        string name,
        string lastname,
        int? tenantId = null)
    {
        passwordService.CreatePasswordHash(password, out var hash, out var salt);

        return new Account
        {
            AccountID = id,
            AccountRoleID = roleId,
            TenantID = tenantId,
            AccountUsername = username,
            AccountEmail = email,
            AccountPasswordHash = hash,
            AccountPasswordSalt = salt,
            AccountName = name,
            AccountLastname = lastname,
            AccountEmailConfirmed = true,
            AccountLocked = false,
            AccountFailPasswordCount = 0,
            AccountIsActive = true,
            AccountDeleted = false,
            AccountCreationDate = DateTime.UtcNow,
        };
    }
}
