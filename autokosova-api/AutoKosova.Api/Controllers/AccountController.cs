using AutoKosova.Api.Authorization;
using AutoKosova.Business.DTOs;
using AutoKosova.Business.DTOs.Accounts;
using AutoKosova.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : BaseApiController
    {
        private readonly AuthService _authService;
        private readonly AccountService _accountService;

        public AccountController(AuthService authService, AccountService accountService)
        {
            _authService = authService;
            _accountService = accountService;
        }

        [HasPermission("Accounts.View")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _accountService.GetAllAsync();

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result);
        }

        [HasPermission("Accounts.View")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _accountService.GetByIdAsync(id);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result);
        }

        [HasPermission("Accounts.Create")]
        [HttpPost]
        public async Task<IActionResult> Create(AccountCreateRequestDto request)
        {
            var result = await _accountService.CreateAsync(request);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result);
        }

        [HasPermission("Accounts.Update")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, AccountUpdateRequestDto request)
        {
            var result = await _accountService.UpdateAsync(id, request);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result);
        }

        [HasPermission("Accounts.Delete")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _accountService.DeleteAsync(id);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result);
        }

        [AllowAnonymous]
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

        [AllowAnonymous]
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
                TenantID = account.TenantID,
                TenantName = account.Tenant?.TenantName,
                OwnerAccountID = account.Tenant?.OwnerAccountID,
                Role = auth.Role,
                AccountUsername = account.AccountUsername,
                AccountEmail = account.AccountEmail,
                AccountName = account.AccountName,
                AccountLastname = account.AccountLastname
            });
        }
    }
}
