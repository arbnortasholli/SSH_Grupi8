using System.Net;
using System.Net.Http.Json;
using AutoKosova.ApiTests.Infrastructure;
using FluentAssertions;

namespace AutoKosova.ApiTests.Controllers;

public class TenantsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public TenantsControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAll_WhenUserHasNoPermission_ReturnsForbidden()
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/tenant");
        AddAuthHeaders(request, accountId: 300, role: "Viewer", roleId: 4);

        var response = await _client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetAll_WhenTokenIsMissing_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync("/api/tenant");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Create_WhenUserHasNoPermission_ReturnsForbidden()
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/tenant");
        AddAuthHeaders(request, accountId: 300, role: "Viewer", roleId: 4);
        request.Content = JsonContent.Create(new
        {
            tenantName = "New Tenant",
            tenantIsActive = true,
        });

        var response = await _client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    private static void AddAuthHeaders(HttpRequestMessage request, int accountId, string role, int roleId)
    {
        request.Headers.Add("X-Test-Auth", "true");
        request.Headers.Add("X-Test-AccountId", accountId.ToString());
        request.Headers.Add("X-Test-Role", role);
        request.Headers.Add("X-Test-AccountRoleId", roleId.ToString());
        request.Headers.Add("X-Test-Username", role.ToLowerInvariant());
        request.Headers.Add("X-Test-Email", $"{role.ToLowerInvariant()}@test.local");
    }
}
