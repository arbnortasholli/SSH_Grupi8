using System.Net;
using System.Net.Http.Json;
using AutoKosova.ApiTests.Infrastructure;
using FluentAssertions;

namespace AutoKosova.ApiTests.Controllers;

public class CarsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public CarsControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetCars_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/cars");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        (await response.Content.ReadAsStringAsync()).Should().Contain("Audi");
    }

    [Fact]
    public async Task GetById_WhenCarExists_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/cars/1");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        (await response.Content.ReadAsStringAsync()).Should().Contain("Audi");
    }

    [Fact]
    public async Task GetById_WhenCarDoesNotExist_ReturnsNotFound()
    {
        var response = await _client.GetAsync("/api/cars/999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Create_WhenUserHasNoPermission_ReturnsForbidden()
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/cars");
        AddAuthHeaders(request, accountId: 300, role: "Viewer", roleId: 4);

        var form = new MultipartFormDataContent
        {
            { new StringContent("1"), "tenantID" },
            { new StringContent("100"), "createdByAccountID" },
            { new StringContent("2023 Mercedes C220"), "carTitle" },
            { new StringContent("Mercedes"), "carBrand" },
            { new StringContent("C220"), "carModel" },
            { new StringContent("2023"), "carYear" },
            { new StringContent("25000"), "carMileage" },
            { new StringContent("Diesel"), "carFuelType" },
            { new StringContent("Automatic"), "carTransmission" },
            { new StringContent("Sedan"), "carBodyType" },
            { new StringContent("Black"), "carColor" },
            { new StringContent("New test car"), "carDescription" },
            { new StringContent("true"), "isForSale" },
            { new StringContent("22000"), "salePrice" },
            { new StringContent("false"), "isForRent" },
            { new StringContent("Available"), "carStatus" },
        };
        request.Content = form;

        var response = await _client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Create_WhenTokenIsMissing_ReturnsUnauthorized()
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/cars")
        {
            Content = new MultipartFormDataContent
            {
                { new StringContent("Test"), "carTitle" },
            }
        };

        var response = await _client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Update_WhenTokenIsMissing_ReturnsUnauthorized()
    {
        using var request = new HttpRequestMessage(HttpMethod.Put, "/api/cars/999");
        request.Content = JsonContent.Create(new
        {
            tenantID = 1,
            carTitle = "Updated car",
            carBrand = "BMW",
            carModel = "320d",
            carYear = 2022,
            carMileage = 12000,
            carFuelType = "Diesel",
            carTransmission = "Automatic",
            carBodyType = "Sedan",
            carColor = "Blue",
            carDescription = "Updated",
            isForSale = true,
            salePrice = 15000,
            isForRent = false,
            rentalDailyPrice = (decimal?)null,
            carStatus = "Available",
        });

        var response = await _client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Delete_WhenUserHasNoPermission_ReturnsForbidden()
    {
        using var request = new HttpRequestMessage(HttpMethod.Delete, "/api/cars/1");
        AddAuthHeaders(request, accountId: 300, role: "Viewer", roleId: 4);

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
        request.Headers.Add("X-Test-TenantId", "1");
    }
}
