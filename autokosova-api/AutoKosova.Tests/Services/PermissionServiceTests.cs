using AutoKosova.Business.DTOs.Permission;
using AutoKosova.Business.Services;
using AutoKosova.Tests.Helpers;
using FluentAssertions;

namespace AutoKosova.Tests.Services;

public class PermissionServiceTests
{
    [Fact]
    public async Task CreateAsync_WhenPermissionIsValid_ReturnsSuccess()
    {
        using var db = new SqliteTestDbContext();
        var service = new PermissionService(db.Context);

        var result = await service.CreateAsync(new PermissionCreateRequestDto
        {
            PermissionName = "Cars.View",
            PermissionDescription = "View cars",
            PermissionGroup = "Cars",
        });

        result.IsSuccess.Should().BeTrue();
        result.Data!.PermissionName.Should().Be("Cars.View");
    }

    [Fact]
    public async Task CreateAsync_WhenPermissionAlreadyExists_ReturnsBadRequest()
    {
        using var db = new SqliteTestDbContext();
        db.Context.Permissions.Add(TestDataFactory.CreatePermission(1, "Cars.View"));
        await db.Context.SaveChangesAsync();

        var service = new PermissionService(db.Context);

        var result = await service.CreateAsync(new PermissionCreateRequestDto
        {
            PermissionName = "Cars.View",
        });

        result.Status.Should().Be(ServiceStatus.BadRequest);
        result.Error.Should().Be("Permission ekziston tashme!");
    }

    [Fact]
    public async Task UpdateAsync_WhenPermissionDoesNotExist_ReturnsNotFound()
    {
        using var db = new SqliteTestDbContext();
        var service = new PermissionService(db.Context);

        var result = await service.UpdateAsync(123, new PermissionUpdateRequestDto
        {
            PermissionName = "Cars.Update",
            PersmissionIsActive = true,
        });

        result.Status.Should().Be(ServiceStatus.NotFound);
    }

    [Fact]
    public async Task DeleteAsync_WhenPermissionDoesNotExist_ReturnsNotFound()
    {
        using var db = new SqliteTestDbContext();
        var service = new PermissionService(db.Context);

        var result = await service.DeleteAsync(456);

        result.Status.Should().Be(ServiceStatus.NotFound);
    }
}
