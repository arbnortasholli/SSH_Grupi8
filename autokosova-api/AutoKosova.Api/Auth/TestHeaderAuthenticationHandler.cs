using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace AutoKosova.Api.Authorization;

public class TestHeaderAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string SchemeName = "TestHeader";

    public TestHeaderAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("X-Test-Auth", out var shouldAuthenticate) ||
            !string.Equals(shouldAuthenticate.ToString(), "true", StringComparison.OrdinalIgnoreCase))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var accountId = Request.Headers.TryGetValue("X-Test-AccountId", out var accountIdHeader)
            ? accountIdHeader.ToString()
            : "100";
        var role = Request.Headers.TryGetValue("X-Test-Role", out var roleHeader)
            ? roleHeader.ToString()
            : "Seller";
        var roleId = Request.Headers.TryGetValue("X-Test-AccountRoleId", out var roleIdHeader)
            ? roleIdHeader.ToString()
            : "2";
        var username = Request.Headers.TryGetValue("X-Test-Username", out var usernameHeader)
            ? usernameHeader.ToString()
            : "seller";
        var email = Request.Headers.TryGetValue("X-Test-Email", out var emailHeader)
            ? emailHeader.ToString()
            : "seller@test.local";

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, accountId),
            new(ClaimTypes.Name, username),
            new(ClaimTypes.Email, email),
            new(ClaimTypes.Role, role),
            new("AccountID", accountId),
            new("AccountRoleID", roleId),
            new("AccountUsername", username),
            new("AccountEmail", email),
            new("Role", role),
        };

        if (Request.Headers.TryGetValue("X-Test-TenantId", out var tenantIdHeader))
        {
            claims.Add(new Claim("TenantID", tenantIdHeader.ToString()));
        }

        var identity = new ClaimsIdentity(claims, SchemeName);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, SchemeName);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
