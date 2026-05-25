using System.Net;
using System.Net.Http.Json;
using AutoKosova.ApiTests.Infrastructure;
using FluentAssertions;

namespace AutoKosova.ApiTests.Controllers;

public class RentalBookingsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public RentalBookingsControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CheckAvailability_WhenDatesAreValid_ReturnsOk()
    {
        var startDate = Uri.EscapeDataString(DateTime.UtcNow.Date.AddDays(10).ToString("O"));
        var endDate = Uri.EscapeDataString(DateTime.UtcNow.Date.AddDays(12).ToString("O"));

        var response = await _client.GetAsync($"/api/cars/2/availability?startDate={startDate}&endDate={endDate}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        (await response.Content.ReadAsStringAsync()).Should().Contain("isAvailable");
    }

    [Fact]
    public async Task Create_WhenTokenIsMissing_ReturnsUnauthorized()
    {
        var response = await _client.PostAsJsonAsync("/api/rental-bookings", new
        {
            carID = 2,
            rentalBookingStartDate = DateTime.UtcNow.Date.AddDays(7),
            rentalBookingEndDate = DateTime.UtcNow.Date.AddDays(9),
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CheckAvailability_WhenCarDoesNotExist_ReturnsNotFound()
    {
        var startDate = Uri.EscapeDataString(DateTime.UtcNow.Date.AddDays(10).ToString("O"));
        var endDate = Uri.EscapeDataString(DateTime.UtcNow.Date.AddDays(12).ToString("O"));
        var response = await _client.GetAsync($"/api/cars/999/availability?startDate={startDate}&endDate={endDate}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetMyBookings_WhenTokenIsMissing_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync("/api/accounts/me/bookings");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetByTenant_WhenRentalRequestsDifferentTenant_ReturnsForbidden()
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/tenants/2/bookings");
        AddAuthHeaders(request, accountId: 101, role: "Rental", roleId: 5, tenantId: 1);

        var response = await _client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetAll_WhenRentalIsAuthenticated_ReturnsOnlyOwnTenantBookings()
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/rental-bookings");
        AddAuthHeaders(request, accountId: 101, role: "Rental", roleId: 5, tenantId: 1);

        var response = await _client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var bookings = await response.Content.ReadFromJsonAsync<List<RentalBookingListResponse>>();
        bookings.Should().NotBeNull();
        bookings!.Should().OnlyContain(booking => booking.TenantID == 1);
    }

    private static void AddAuthHeaders(HttpRequestMessage request, int accountId, string role, int roleId, int tenantId = 1)
    {
        request.Headers.Add("X-Test-Auth", "true");
        request.Headers.Add("X-Test-AccountId", accountId.ToString());
        request.Headers.Add("X-Test-Role", role);
        request.Headers.Add("X-Test-AccountRoleId", roleId.ToString());
        request.Headers.Add("X-Test-Username", role.ToLowerInvariant());
        request.Headers.Add("X-Test-Email", $"{role.ToLowerInvariant()}@test.local");
        request.Headers.Add("X-Test-TenantId", tenantId.ToString());
    }

    private sealed class RentalBookingListResponse
    {
        public int RentalBookingID { get; set; }
        public int TenantID { get; set; }
    }
}
