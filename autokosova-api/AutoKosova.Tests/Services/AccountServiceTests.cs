using AutoKosova.Business.DTOs.Accounts;
using AutoKosova.Business.Services;
using AutoKosova.Tests.Helpers;
using FluentAssertions;

namespace AutoKosova.Tests.Services;

public class AccountServiceTests
{
    [Fact]
    public async Task CreateAsync_WhenRoleDoesNotExist_ReturnsBadRequest()
    {
        using var db = new SqliteTestDbContext();
        var service = new AccountService(db.Context, new PasswordService());

        var result = await service.CreateAsync(new AccountCreateRequestDto
        {
            AccountRoleID = 99,
            AccountUsername = "user1",
            AccountEmail = "user1@example.com",
            Password = "Password123!",
            AccountName = "User",
            AccountLastname = "One",
            AccountIsActive = true,
        });

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Invalid account role.");
    }

    [Fact]
    public async Task UpdateAsync_WhenAccountDoesNotExist_ReturnsNotFound()
    {
        using var db = new SqliteTestDbContext();
        db.Context.AccountRoles.Add(TestDataFactory.CreateRole(1, "Customer"));
        await db.Context.SaveChangesAsync();

        var service = new AccountService(db.Context, new PasswordService());

        var result = await service.UpdateAsync(999, new AccountUpdateRequestDto
        {
            AccountRoleID = 1,
            AccountUsername = "user1",
            AccountEmail = "user1@example.com",
            AccountName = "User",
            AccountLastname = "One",
            AccountIsActive = true,
        });

        result.Status.Should().Be(ServiceStatus.NotFound);
        result.Error.Should().Be("Account not found.");
    }
}
