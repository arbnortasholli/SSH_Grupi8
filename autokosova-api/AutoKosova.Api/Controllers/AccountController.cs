using AutoKosova.Api.DTOs;
using AutoKosova.Business.Models;
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
            var result = await _authService.Register(new RegisterAccountCommand
            {
                AccountRoleID = request.AccountRoleID,
                AccountUsername = request.AccountUsername,
                AccountEmail = request.AccountEmail,
                Password = request.Password,
                AccountName = request.AccountName,
                AccountLastname = request.AccountLastname,
                AccountPhoneNumber = request.AccountPhoneNumber,
                AccountAddress = request.AccountAddress,
                AccountCity = request.AccountCity
            });

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
            var result = await _authService.Login(new LoginCommand
            {
                EmailOrUsername = request.EmailOrUsername,
                Password = request.Password
            });

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            var auth = result.Data!;

            return Ok(new AuthResponseDto
            {
                Token = auth.Token,
                ExpiresAt = auth.ExpiresAt,
                AccountID = auth.AccountID,
                AccountRoleID = auth.AccountRoleID,
                Role = auth.Role,
                AccountUsername = auth.AccountUsername,
                AccountEmail = auth.AccountEmail,
                AccountName = auth.AccountName,
                AccountLastname = auth.AccountLastname
            });
        }
    }
}
