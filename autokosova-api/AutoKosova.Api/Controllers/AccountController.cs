using AutoKosova.Api.DTOs;
using AutoKosova.Business.Services;
using Microsoft.AspNetCore.Mvc;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : BaseApiController
    {
        private readonly AuthService _authService;

        public AccountController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequestDto request)
        {
            var result = await _authService.Register(
                request.AccountRoleID,
                request.AccountUsername,
                request.AccountEmail,
                request.Password,
                request.AccountName,
                request.AccountLastname,
                request.AccountPhoneNumber,
                request.AccountAddress,
                request.AccountCity);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(new
            {
                message = "Account registered successfully.",
                accountID = result.Data!.AccountID
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequestDto request)
        {
            var result = await _authService.Login(request.EmailOrUsername, request.Password);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            var auth = result.Data!;
            var account = auth.Account;

            return Ok(new AuthResponseDto
            {
                Token = auth.Token,
                ExpiresAt = auth.ExpiresAt,
                AccountID = account.AccountID,
                AccountRoleID = account.AccountRoleID,
                Role = auth.Role,
                AccountUsername = account.AccountUsername,
                AccountEmail = account.AccountEmail,
                AccountName = account.AccountName,
                AccountLastname = account.AccountLastname
            });
        }
    }
}
