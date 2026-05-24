using AutoKosova.Business.Services;
using AutoKosova.Entity;
using AutoKosova.Tests.Helpers;
using FluentAssertions;

namespace AutoKosova.Tests.Services;

public class AuthServiceTests
{
    [Fact]
    public async Task Register_WhenInputIsValid_ReturnsSuccess()
    {
        using var db = new SqliteTestDbContext();
        db.Context.AccountRoles.Add(TestDataFactory.CreateRole(1, "Customer"));
        await db.Context.SaveChangesAsync();

        var service = new AuthService(
            db.Context,
            new PasswordService(),
            new JwtService(TestDataFactory.CreateJwtConfiguration()));

        var result = await service.Register(
            1,
            "newuser",
            "newuser@example.com",
            "Password123!",
            "New",
            "User",
            null,
            null,
            null);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.AccountUsername.Should().Be("newuser");
        result.Data.AccountEmail.Should().Be("newuser@example.com");
    }

    [Fact]
    public async Task Register_WhenUsernameAlreadyExists_ReturnsBadRequest()
    {
        using var db = new SqliteTestDbContext();
        db.Context.AccountRoles.Add(TestDataFactory.CreateRole(1, "Customer"));
        db.Context.Accounts.Add(TestDataFactory.CreateAccount(1, 1, "existing", "existing@example.com", "Password123!"));
        await db.Context.SaveChangesAsync();

        var service = new AuthService(
            db.Context,
            new PasswordService(),
            new JwtService(TestDataFactory.CreateJwtConfiguration()));

        var result = await service.Register(1, "existing", "other@example.com", "Password123!", "Test", "User", null, null, null);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Username already exists.");
    }

    [Fact]
    public async Task Login_WhenPasswordIsInvalid_ReturnsUnauthorizedAndIncrementsFailedCount()
    {
        using var db = new SqliteTestDbContext();
        var role = TestDataFactory.CreateRole(1, "Customer");
        var account = TestDataFactory.CreateAccount(1, 1, "loginuser", "login@example.com", "CorrectPassword1!", "Customer");
        account.AccountRole = role;
        db.Context.AccountRoles.Add(role);
        db.Context.Accounts.Add(account);
        await db.Context.SaveChangesAsync();

        var service = new AuthService(
            db.Context,
            new PasswordService(),
            new JwtService(TestDataFactory.CreateJwtConfiguration()));

        var result = await service.Login("loginuser", "WrongPassword!");

        result.IsSuccess.Should().BeFalse();
        result.Status.Should().Be(ServiceStatus.Unauthorized);
        result.Error.Should().Be("Invalid credentials.");
        account.AccountFailPasswordCount.Should().Be(1);
    }

    [Fact]
    public async Task Login_WhenCredentialsAreValid_ReturnsToken()
    {
        using var db = new SqliteTestDbContext();
        var role = TestDataFactory.CreateRole(1, "Customer");
        var tenant = TestDataFactory.CreateTenant();
        var account = TestDataFactory.CreateAccount(1, 1, "validuser", "valid@example.com", "CorrectPassword1!", "Customer", tenant.TenantID);
        account.AccountRole = role;
        account.Tenant = tenant;

        db.Context.AccountRoles.Add(role);
        db.Context.Tenants.Add(tenant);
        db.Context.Accounts.Add(account);
        await db.Context.SaveChangesAsync();

        var service = new AuthService(
            db.Context,
            new PasswordService(),
            new JwtService(TestDataFactory.CreateJwtConfiguration()));

        var result = await service.Login("validuser", "CorrectPassword1!");

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Token.Should().NotBeNullOrWhiteSpace();
        result.Data.Role.Should().Be("Customer");
    }
}
