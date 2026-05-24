using AutoKosova.Business.Services;
using AutoKosova.Tests.Helpers;
using FluentAssertions;

namespace AutoKosova.Tests.Services;

public class TenantServiceTests
{
    [Fact]
    public async Task CreateAsync_WhenDtoIsValid_ReturnsSuccess()
    {
        using var db = new SqliteTestDbContext();
        db.Context.AccountRoles.Add(TestDataFactory.CreateRole(1, "Seller"));
        db.Context.Accounts.Add(TestDataFactory.CreateAccount(1, 1, "owner", "owner@example.com", "Password123!"));
        await db.Context.SaveChangesAsync();

        var service = new TenantService(db.Context);
        var request = TestDataFactory.CreateTenantRequest();
        request.OwnerAccountID = 1;

        var result = await service.CreateAsync(request);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.TenantName.Should().Be("Tenant One");
    }

    [Fact]
    public async Task CreateAsync_WhenNameIsMissing_ReturnsBadRequest()
    {
        using var db = new SqliteTestDbContext();
        var service = new TenantService(db.Context);

        var result = await service.CreateAsync(TestDataFactory.CreateTenantRequest(string.Empty));

        result.Status.Should().Be(ServiceStatus.BadRequest);
        result.Error.Should().Be("Tenant name is required.");
    }

    [Fact]
    public async Task UpdateAsync_WhenTenantDoesNotExist_ReturnsNotFound()
    {
        using var db = new SqliteTestDbContext();
        var service = new TenantService(db.Context);

        var result = await service.UpdateAsync(123, new AutoKosova.Business.DTOs.Tenants.TenantUpdateRequestDto
        {
            TenantName = "Updated tenant",
            TenantIsActive = true,
        });

        result.Status.Should().Be(ServiceStatus.NotFound);
    }

    [Fact]
    public async Task DeleteAsync_WhenTenantDoesNotExist_ReturnsNotFound()
    {
        using var db = new SqliteTestDbContext();
        var service = new TenantService(db.Context);

        var result = await service.DeleteAsync(999);

        result.Status.Should().Be(ServiceStatus.NotFound);
        result.Error.Should().Be("Tenant nuk u gjet.");
    }
}
