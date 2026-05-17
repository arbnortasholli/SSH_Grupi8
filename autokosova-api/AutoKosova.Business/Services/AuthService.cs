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

        public async Task<ServiceResult<Account>> Register(
            int accountRoleId,
            string accountUsername,
            string accountEmail,
            string password,
            string accountName,
            string accountLastname,
            string? accountPhoneNumber,
            string? accountAddress,
            string? accountCity)
        {
            var validationError = ValidateRegister(accountUsername, accountEmail, password, accountName, accountLastname);

            if (validationError != null)
            {
                return ServiceResult<Account>.BadRequest(validationError);
            }

            var usernameExists = await _context.Accounts
                .AnyAsync(a => a.AccountUsername == accountUsername);

            if (usernameExists)
            {
                return ServiceResult<Account>.BadRequest("Username already exists.");
            }

            var emailExists = await _context.Accounts
                .AnyAsync(a => a.AccountEmail == accountEmail);

            if (emailExists)
            {
                return ServiceResult<Account>.BadRequest("Email already exists.");
            }

            var roleExists = await _context.AccountRoles
                .AnyAsync(r => r.AccountRoleID == accountRoleId);

            if (!roleExists)
            {
                return ServiceResult<Account>.BadRequest("Invalid account role.");
            }

            _passwordService.CreatePasswordHash(
                password,
                out var passwordHash,
                out var passwordSalt
            );

            var account = new Account
            {
                AccountRoleID = accountRoleId,
                AccountUsername = accountUsername.Trim(),
                AccountEmail = accountEmail.Trim(),
                AccountPasswordHash = passwordHash,
                AccountPasswordSalt = passwordSalt,
                AccountName = accountName.Trim(),
                AccountLastname = accountLastname.Trim(),
                AccountPhoneNumber = accountPhoneNumber,
                AccountAddress = accountAddress,
                AccountCity = accountCity,

                AccountEmailConfirmed = false,
                AccountLocked = false,
                AccountFailPasswordCount = 0,
                AccountIsActive = true,
                AccountDeleted = false,
                AccountCreationDate = DateTime.UtcNow
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            return ServiceResult<Account>.Success(account);
        }

        public async Task<ServiceResult<(Account Account, string Token, DateTime ExpiresAt, string Role)>> Login(
            string emailOrUsername,
            string password)
        {
            if (string.IsNullOrWhiteSpace(emailOrUsername))
            {
                return ServiceResult<(Account Account, string Token, DateTime ExpiresAt, string Role)>.BadRequest("Email or username is required.");
            }

            if (string.IsNullOrWhiteSpace(password))
            {
                return ServiceResult<(Account Account, string Token, DateTime ExpiresAt, string Role)>.BadRequest("Password is required.");
            }

            var account = await _context.Accounts
                .Include(a => a.AccountRole)
                .FirstOrDefaultAsync(a =>
                    a.AccountEmail == emailOrUsername ||
                    a.AccountUsername == emailOrUsername);

            if (account == null)
            {
                return ServiceResult<(Account Account, string Token, DateTime ExpiresAt, string Role)>.Unauthorized("Invalid credentials.");
            }

            var passwordIsValid = _passwordService.VerifyPasswordHash(
                password,
                account.AccountPasswordHash,
                account.AccountPasswordSalt
            );

            if (!passwordIsValid)
            {
                return ServiceResult<(Account Account, string Token, DateTime ExpiresAt, string Role)>.Unauthorized("Invalid credentials.");
            }

            account.AccountLastLoginDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var roleName = account.AccountRole?.AccountRoleName ?? "User";

            return ServiceResult<(Account Account, string Token, DateTime ExpiresAt, string Role)>.Success((
                account,
                _jwtService.GenerateToken(account),
                _jwtService.GetExpirationDate(),
                roleName
            ));
        }

        private static string? ValidateRegister(
            string accountUsername,
            string accountEmail,
            string password,
            string accountName,
            string accountLastname)
        {
            if (string.IsNullOrWhiteSpace(accountUsername))
            {
                return "Username is required.";
            }

            if (string.IsNullOrWhiteSpace(accountEmail))
            {
                return "Email is required.";
            }

            if (string.IsNullOrWhiteSpace(password))
            {
                return "Password is required.";
            }

            if (string.IsNullOrWhiteSpace(accountName))
            {
                return "Name is required.";
            }

            if (string.IsNullOrWhiteSpace(accountLastname))
            {
                return "Lastname is required.";
            }

            return null;
        }
    }
}
