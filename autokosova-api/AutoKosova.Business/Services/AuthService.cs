using AutoKosova.Business.Models;
using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.EntityFrameworkCore;

namespace AutoKosova.Business.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly PasswordService _passwordService;
        private readonly JwtService _jwtService;

        public AuthService(
            AppDbContext context,
            PasswordService passwordService,
            JwtService jwtService)
        {
            _context = context;
            _passwordService = passwordService;
            _jwtService = jwtService;
        }

        public async Task<ServiceResult<RegisterAccountResult>> Register(RegisterAccountCommand command)
        {
            var validationError = ValidateRegister(command);

            if (validationError != null)
            {
                return ServiceResult<RegisterAccountResult>.BadRequest(validationError);
            }

            var usernameExists = await _context.Accounts
                .AnyAsync(a => a.AccountUsername == command.AccountUsername);

            if (usernameExists)
            {
                return ServiceResult<RegisterAccountResult>.BadRequest("Username already exists.");
            }

            var emailExists = await _context.Accounts
                .AnyAsync(a => a.AccountEmail == command.AccountEmail);

            if (emailExists)
            {
                return ServiceResult<RegisterAccountResult>.BadRequest("Email already exists.");
            }

            var roleExists = await _context.AccountRoles
                .AnyAsync(r => r.AccountRoleID == command.AccountRoleID);

            if (!roleExists)
            {
                return ServiceResult<RegisterAccountResult>.BadRequest("Invalid account role.");
            }

            _passwordService.CreatePasswordHash(
                command.Password,
                out var passwordHash,
                out var passwordSalt
            );

            var account = new Account
            {
                AccountRoleID = command.AccountRoleID,
                AccountUsername = command.AccountUsername.Trim(),
                AccountEmail = command.AccountEmail.Trim(),
                AccountPasswordHash = passwordHash,
                AccountPasswordSalt = passwordSalt,
                AccountName = command.AccountName.Trim(),
                AccountLastname = command.AccountLastname.Trim(),
                AccountPhoneNumber = command.AccountPhoneNumber,
                AccountAddress = command.AccountAddress,
                AccountCity = command.AccountCity,

                AccountEmailConfirmed = false,
                AccountLocked = false,
                AccountFailPasswordCount = 0,
                AccountIsActive = true,
                AccountDeleted = false,
                AccountCreationDate = DateTime.UtcNow
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            return ServiceResult<RegisterAccountResult>.Success(new RegisterAccountResult
            {
                AccountID = account.AccountID
            });
        }

        public async Task<ServiceResult<AuthResult>> Login(LoginCommand command)
        {
            if (string.IsNullOrWhiteSpace(command.EmailOrUsername))
            {
                return ServiceResult<AuthResult>.BadRequest("Email or username is required.");
            }

            if (string.IsNullOrWhiteSpace(command.Password))
            {
                return ServiceResult<AuthResult>.BadRequest("Password is required.");
            }

            var account = await _context.Accounts
                .Include(a => a.AccountRole)
                .FirstOrDefaultAsync(a =>
                    a.AccountEmail == command.EmailOrUsername ||
                    a.AccountUsername == command.EmailOrUsername);

            if (account == null)
            {
                return ServiceResult<AuthResult>.Unauthorized("Invalid credentials.");
            }

            if (account.AccountDeleted)
            {
                return ServiceResult<AuthResult>.Unauthorized("Account does not exist.");
            }

            if (!account.AccountIsActive)
            {
                return ServiceResult<AuthResult>.Unauthorized("Account is inactive.");
            }

            if (account.AccountLocked)
            {
                return ServiceResult<AuthResult>.Unauthorized("Account is locked.");
            }

            var passwordIsValid = _passwordService.VerifyPasswordHash(
                command.Password,
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

                return ServiceResult<AuthResult>.Unauthorized("Invalid credentials.");
            }

            account.AccountFailPasswordCount = 0;
            account.AccountLastLoginDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var roleName = account.AccountRole?.AccountRoleName ?? "User";

            return ServiceResult<AuthResult>.Success(new AuthResult
            {
                Token = _jwtService.GenerateToken(account),
                ExpiresAt = _jwtService.GetExpirationDate(),
                AccountID = account.AccountID,
                AccountRoleID = account.AccountRoleID,
                Role = roleName,
                AccountUsername = account.AccountUsername,
                AccountEmail = account.AccountEmail,
                AccountName = account.AccountName,
                AccountLastname = account.AccountLastname
            });
        }

        private static string? ValidateRegister(RegisterAccountCommand command)
        {
            if (string.IsNullOrWhiteSpace(command.AccountUsername))
            {
                return "Username is required.";
            }

            if (string.IsNullOrWhiteSpace(command.AccountEmail))
            {
                return "Email is required.";
            }

            if (string.IsNullOrWhiteSpace(command.Password))
            {
                return "Password is required.";
            }

            if (string.IsNullOrWhiteSpace(command.AccountName))
            {
                return "Name is required.";
            }

            if (string.IsNullOrWhiteSpace(command.AccountLastname))
            {
                return "Lastname is required.";
            }

            return null;
        }
    }
}
