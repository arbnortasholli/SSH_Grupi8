using AutoKosova.Api.DTOs;
using AutoKosova.Business.Services;
using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PasswordService _passwordService;
        private readonly JwtService _jwtService;

        public AccountController(
            AppDbContext context,
            PasswordService passwordService,
            JwtService jwtService)
        {
            _context = context;
            _passwordService = passwordService;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.AccountUsername))
            {
                return BadRequest("Username is required.");
            }

            if (string.IsNullOrWhiteSpace(request.AccountEmail))
            {
                return BadRequest("Email is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Password is required.");
            }

            if (string.IsNullOrWhiteSpace(request.AccountName))
            {
                return BadRequest("Name is required.");
            }

            if (string.IsNullOrWhiteSpace(request.AccountLastname))
            {
                return BadRequest("Lastname is required.");
            }

            var usernameExists = await _context.Accounts
                .AnyAsync(a => a.AccountUsername == request.AccountUsername);

            if (usernameExists)
            {
                return BadRequest("Username already exists.");
            }

            var emailExists = await _context.Accounts
                .AnyAsync(a => a.AccountEmail == request.AccountEmail);

            if (emailExists)
            {
                return BadRequest("Email already exists.");
            }

            var roleExists = await _context.AccountRoles
                .AnyAsync(r => r.AccountRoleID == request.AccountRoleID);

            if (!roleExists)
            {
                return BadRequest("Invalid account role.");
            }

            _passwordService.CreatePasswordHash(
                request.Password,
                out string passwordHash,
                out byte[] passwordSalt
            );

            var account = new Account
            {
                AccountRoleID = request.AccountRoleID,
                AccountUsername = request.AccountUsername.Trim(),
                AccountEmail = request.AccountEmail.Trim(),
                AccountPasswordHash = passwordHash,
                AccountPasswordSalt = passwordSalt,
                AccountName = request.AccountName.Trim(),
                AccountLastname = request.AccountLastname.Trim(),
                AccountPhoneNumber = request.AccountPhoneNumber,
                AccountAddress = request.AccountAddress,
                AccountCity = request.AccountCity,

                AccountEmailConfirmed = false,
                AccountLocked = false,
                AccountFailPasswordCount = 0,
                AccountIsActive = true,
                AccountDeleted = false,
                AccountCreationDate = DateTime.UtcNow
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Account registered successfully.",
                accountID = account.AccountID
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.EmailOrUsername))
            {
                return BadRequest("Email or username is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Password is required.");
            }

            var account = await _context.Accounts
                .Include(a => a.AccountRole)
                .FirstOrDefaultAsync(a =>
                    a.AccountEmail == request.EmailOrUsername ||
                    a.AccountUsername == request.EmailOrUsername);

            if (account == null)
            {
                return Unauthorized("Invalid credentials.");
            }

            if (account.AccountDeleted)
            {
                return Unauthorized("Account does not exist.");
            }

            if (!account.AccountIsActive)
            {
                return Unauthorized("Account is inactive.");
            }

            if (account.AccountLocked)
            {
                return Unauthorized("Account is locked.");
            }

            var passwordIsValid = _passwordService.VerifyPasswordHash(
                request.Password,
                account.AccountPasswordHash,
                account.AccountPasswordSalt
            );

            if (!passwordIsValid)
            {
                account.AccountFailPasswordCount += 1;
                account.AccountLastFailedLoginDate = DateTime.UtcNow;

                if (account.AccountFailPasswordCount >= 5)
                {
                    account.AccountLocked = true;
                    account.AccountLockDate = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                return Unauthorized("Invalid credentials.");
            }

            account.AccountFailPasswordCount = 0;
            account.AccountLastLoginDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateToken(account);
            var expiresAt = _jwtService.GetExpirationDate();

            var response = new AuthResponseDto
            {
                Token = token,
                ExpiresAt = expiresAt,
                AccountID = account.AccountID,
                AccountRoleID = account.AccountRoleID,
                Role = account.AccountRole?.AccountRoleName ?? "User",

                AccountUsername = account.AccountUsername,
                AccountEmail = account.AccountEmail,
                AccountName = account.AccountName,
                AccountLastname = account.AccountLastname
            };

            return Ok(response);
        }
    }
}
