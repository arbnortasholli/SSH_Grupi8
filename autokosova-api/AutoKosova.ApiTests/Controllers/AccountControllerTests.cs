using System.Net;
using System.Net.Http.Json;
using AutoKosova.ApiTests.Infrastructure;
using AutoKosova.Business.DTOs;
using FluentAssertions;

namespace AutoKosova.ApiTests.Controllers;

public class AccountControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AccountControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_WhenRequestIsValid_ReturnsOk()
    {
        var response = await _client.PostAsJsonAsync("/api/account/register", new RegisterRequestDto
        {
            AccountRoleID = 3,
            AccountUsername = "newcustomer",
            AccountEmail = "newcustomer@test.local",
            Password = "Password123!",
            AccountName = "New",
            AccountLastname = "Customer",
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain("Account registered successfully.");
    }

    [Fact]
    public async Task Register_WhenEmailAlreadyExists_ReturnsBadRequest()
    {
        var response = await _client.PostAsJsonAsync("/api/account/register", new RegisterRequestDto
        {
            AccountRoleID = 3,
            AccountUsername = "anothercustomer",
            AccountEmail = "customer@test.local",
            Password = "Password123!",
            AccountName = "Another",
            AccountLastname = "Customer",
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await response.Content.ReadAsStringAsync()).Should().Contain("Email already exists.");
    }

    [Fact]
    public async Task Login_WhenCredentialsAreValid_ReturnsOk()
    {
        var response = await _client.PostAsJsonAsync("/api/account/login", new LoginRequestDto
        {
            EmailOrUsername = "customer",
            Password = "Customer123!",
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        body.Should().NotBeNull();
        body!.Token.Should().NotBeNullOrWhiteSpace();
        body.AccountUsername.Should().Be("customer");
    }

    [Fact]
    public async Task Login_WhenPasswordIsInvalid_ReturnsUnauthorized()
    {
        var response = await _client.PostAsJsonAsync("/api/account/login", new LoginRequestDto
        {
            EmailOrUsername = "customer",
            Password = "WrongPassword!",
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        (await response.Content.ReadAsStringAsync()).Should().Contain("Invalid credentials.");
    }
}
