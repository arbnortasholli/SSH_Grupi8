using AutoKosova.Entity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AutoKosova.Api.Services
{
    public class JwtService
    {
        private readonly IConfiguration _configuration;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(Account account)
        {
            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];

            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                throw new Exception("Jwt:Key is missing in appsettings.json.");
            }

            var roleName = account.AccountRole?.AccountRoleName ?? "User";

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, account.AccountID.ToString()),
                new Claim(ClaimTypes.Name, account.AccountUsername),
                new Claim(ClaimTypes.Email, account.AccountEmail),
                new Claim(ClaimTypes.Role, roleName),

                new Claim("AccountID", account.AccountID.ToString()),
                new Claim("AccountRoleID", account.AccountRoleID.ToString()),
                new Claim("AccountUsername", account.AccountUsername),
                new Claim("AccountEmail", account.AccountEmail),
                new Claim("Role", roleName)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var expireMinutes = Convert.ToInt32(_configuration["Jwt:ExpireMinutes"]);

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expireMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public DateTime GetExpirationDate()
        {
            var expireMinutes = Convert.ToInt32(_configuration["Jwt:ExpireMinutes"]);

            return DateTime.UtcNow.AddMinutes(expireMinutes);
        }
    }
}