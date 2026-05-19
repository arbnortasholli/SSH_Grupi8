using AutoKosova.Business.DTOs.Accounts;
using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.EntityFrameworkCore;

namespace AutoKosova.Business.Services
{
    public class AccountService
    {
        private readonly AppDbContext _context;
        private readonly PasswordService _passwordService;

        public AccountService(AppDbContext context, PasswordService passwordService)
        {
            _context = context;
            _passwordService = passwordService;
        }

        public async Task<ServiceResult<List<AccountResponseDto>>> GetAllAsync()
        {
            var accounts = await _context.Accounts
                .AsNoTracking()
                .Include(x => x.AccountRole)
                .Where(x => !x.AccountDeleted)
                .Select(x => new AccountResponseDto
                {
                    AccountID = x.AccountID,
                    AccountRoleID = x.AccountRoleID,
                    Role = x.AccountRole != null ? x.AccountRole.AccountRoleName : null,
                    AccountUsername = x.AccountUsername,
                    AccountEmail = x.AccountEmail,
                    AccountName = x.AccountName,
                    AccountLastname = x.AccountLastname,
                    AccountPhoneNumber = x.AccountPhoneNumber,
                    AccountAddress = x.AccountAddress,
                    AccountCity = x.AccountCity,
                    AccountIsActive = x.AccountIsActive,
                    AccountCreationDate = x.AccountCreationDate
                })
                .ToListAsync();

            return ServiceResult<List<AccountResponseDto>>.Success(accounts, "Accounts loaded successfully.");
        }

        public async Task<ServiceResult<AccountResponseDto>> GetByIdAsync(int id)
        {
            var account = await _context.Accounts
                .AsNoTracking()
                .Include(x => x.AccountRole)
                .Where(x => x.AccountID == id && !x.AccountDeleted)
                .Select(x => new AccountResponseDto
                {
                    AccountID = x.AccountID,
                    AccountRoleID = x.AccountRoleID,
                    Role = x.AccountRole != null ? x.AccountRole.AccountRoleName : null,
                    AccountUsername = x.AccountUsername,
                    AccountEmail = x.AccountEmail,
                    AccountName = x.AccountName,
                    AccountLastname = x.AccountLastname,
                    AccountPhoneNumber = x.AccountPhoneNumber,
                    AccountAddress = x.AccountAddress,
                    AccountCity = x.AccountCity,
                    AccountIsActive = x.AccountIsActive,
                    AccountCreationDate = x.AccountCreationDate
                })
                .FirstOrDefaultAsync();

            if (account == null)
            {
                return ServiceResult<AccountResponseDto>.NotFound("Account not found.");
            }

            return ServiceResult<AccountResponseDto>.Success(account);
        }

        public async Task<ServiceResult<AccountResponseDto>> CreateAsync(AccountCreateRequestDto dto)
        {
            var validationError = ValidateBaseFields(
                dto.AccountRoleID,
                dto.AccountUsername,
                dto.AccountEmail,
                dto.AccountName,
                dto.AccountLastname);

            if (validationError != null)
            {
                return ServiceResult<AccountResponseDto>.BadRequest(validationError);
            }

            if (string.IsNullOrWhiteSpace(dto.Password))
            {
                return ServiceResult<AccountResponseDto>.BadRequest("Password is required.");
            }

            var duplicateError = await GetDuplicateErrorAsync(dto.AccountUsername, dto.AccountEmail);
            if (duplicateError != null)
            {
                return ServiceResult<AccountResponseDto>.BadRequest(duplicateError);
            }

            var roleExists = await _context.AccountRoles
                .AnyAsync(x => x.AccountRoleID == dto.AccountRoleID);

            if (!roleExists)
            {
                return ServiceResult<AccountResponseDto>.BadRequest("Invalid account role.");
            }

            _passwordService.CreatePasswordHash(dto.Password, out var passwordHash, out var passwordSalt);

            var account = new Account
            {
                AccountRoleID = dto.AccountRoleID,
                AccountUsername = dto.AccountUsername.Trim(),
                AccountEmail = dto.AccountEmail.Trim(),
                AccountPasswordHash = passwordHash,
                AccountPasswordSalt = passwordSalt,
                AccountName = dto.AccountName.Trim(),
                AccountLastname = dto.AccountLastname.Trim(),
                AccountPhoneNumber = dto.AccountPhoneNumber?.Trim(),
                AccountAddress = dto.AccountAddress?.Trim(),
                AccountCity = dto.AccountCity?.Trim(),
                AccountEmailConfirmed = false,
                AccountLocked = false,
                AccountFailPasswordCount = 0,
                AccountIsActive = dto.AccountIsActive,
                AccountDeleted = false,
                AccountCreationDate = DateTime.UtcNow
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            await _context.Entry(account).Reference(x => x.AccountRole).LoadAsync();

            return ServiceResult<AccountResponseDto>.Success(ToResponseDto(account), "Account created successfully.");
        }

        public async Task<ServiceResult<AccountResponseDto>> UpdateAsync(int id, AccountUpdateRequestDto dto)
        {
            var account = await _context.Accounts
                .Include(x => x.AccountRole)
                .FirstOrDefaultAsync(x => x.AccountID == id && !x.AccountDeleted);

            if (account == null)
            {
                return ServiceResult<AccountResponseDto>.NotFound("Account not found.");
            }

            var validationError = ValidateBaseFields(
                dto.AccountRoleID,
                dto.AccountUsername,
                dto.AccountEmail,
                dto.AccountName,
                dto.AccountLastname);

            if (validationError != null)
            {
                return ServiceResult<AccountResponseDto>.BadRequest(validationError);
            }

            var duplicateError = await GetDuplicateErrorAsync(dto.AccountUsername, dto.AccountEmail, id);
            if (duplicateError != null)
            {
                return ServiceResult<AccountResponseDto>.BadRequest(duplicateError);
            }

            var roleExists = await _context.AccountRoles
                .AnyAsync(x => x.AccountRoleID == dto.AccountRoleID);

            if (!roleExists)
            {
                return ServiceResult<AccountResponseDto>.BadRequest("Invalid account role.");
            }

            account.AccountRoleID = dto.AccountRoleID;
            account.AccountUsername = dto.AccountUsername.Trim();
            account.AccountEmail = dto.AccountEmail.Trim();
            account.AccountName = dto.AccountName.Trim();
            account.AccountLastname = dto.AccountLastname.Trim();
            account.AccountPhoneNumber = dto.AccountPhoneNumber?.Trim();
            account.AccountAddress = dto.AccountAddress?.Trim();
            account.AccountCity = dto.AccountCity?.Trim();
            account.AccountIsActive = dto.AccountIsActive;

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                _passwordService.CreatePasswordHash(dto.Password, out var passwordHash, out var passwordSalt);
                account.AccountPasswordHash = passwordHash;
                account.AccountPasswordSalt = passwordSalt;
                account.AccountLastPasswordChangeDate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            await _context.Entry(account).Reference(x => x.AccountRole).LoadAsync();

            return ServiceResult<AccountResponseDto>.Success(ToResponseDto(account), "Account updated successfully.");
        }

        public async Task<ServiceResult<bool>> DeleteAsync(int id)
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(x => x.AccountID == id && !x.AccountDeleted);

            if (account == null)
            {
                return ServiceResult<bool>.NotFound("Account not found.");
            }

            account.AccountDeleted = true;
            account.AccountDeletedDate = DateTime.UtcNow;
            account.AccountIsActive = false;

            await _context.SaveChangesAsync();

            return ServiceResult<bool>.Success(true, "Account deleted successfully.");
        }

        private async Task<string?> GetDuplicateErrorAsync(string username, string email, int? currentAccountId = null)
        {
            var usernameExists = await _context.Accounts.AnyAsync(x =>
                !x.AccountDeleted &&
                x.AccountUsername == username.Trim() &&
                (!currentAccountId.HasValue || x.AccountID != currentAccountId.Value));

            if (usernameExists)
            {
                return "Username already exists.";
            }

            var emailExists = await _context.Accounts.AnyAsync(x =>
                !x.AccountDeleted &&
                x.AccountEmail == email.Trim() &&
                (!currentAccountId.HasValue || x.AccountID != currentAccountId.Value));

            if (emailExists)
            {
                return "Email already exists.";
            }

            return null;
        }

        private static string? ValidateBaseFields(int accountRoleId, string accountUsername, string accountEmail, string accountName, string accountLastname)
        {
            if (accountRoleId <= 0)
            {
                return "Account role is required.";
            }

            if (string.IsNullOrWhiteSpace(accountUsername))
            {
                return "Username is required.";
            }

            if (string.IsNullOrWhiteSpace(accountEmail))
            {
                return "Email is required.";
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

        private static AccountResponseDto ToResponseDto(Account account)
        {
            return new AccountResponseDto
            {
                AccountID = account.AccountID,
                AccountRoleID = account.AccountRoleID,
                Role = account.AccountRole?.AccountRoleName,
                AccountUsername = account.AccountUsername,
                AccountEmail = account.AccountEmail,
                AccountName = account.AccountName,
                AccountLastname = account.AccountLastname,
                AccountPhoneNumber = account.AccountPhoneNumber,
                AccountAddress = account.AccountAddress,
                AccountCity = account.AccountCity,
                AccountIsActive = account.AccountIsActive,
                AccountCreationDate = account.AccountCreationDate
            };
        }
    }
}
