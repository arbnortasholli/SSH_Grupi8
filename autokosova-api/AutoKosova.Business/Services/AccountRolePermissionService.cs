using AutoKosova.Business.DTOs.AccountsRolePermission;
using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.EntityFrameworkCore;

namespace AutoKosova.Business.Services
{
    public class AccountRolePermissionService
    {
        private readonly AppDbContext _context;

        public AccountRolePermissionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<AccountRolePermissionResponseDto>> CreateAsync(AccountRolePermissionCreateRequestDto objDto)
        {
            var validationError = await ValidateRolePermissionAsync(objDto.AccountRoleID, objDto.PermissionID);
            if (validationError != null)
            {
                return ServiceResult<AccountRolePermissionResponseDto>.BadRequest(validationError);
            }

            var exists = await _context.AccountRolePermissions.AnyAsync(x =>
                x.AccountRoleID == objDto.AccountRoleID &&
                x.PermissionID == objDto.PermissionID);

            if (exists)
            {
                return ServiceResult<AccountRolePermissionResponseDto>.BadRequest("This role already has this permission.");
            }

            var accountRolePermission = new AccountRolePermission
            {
                AccountRoleID = objDto.AccountRoleID,
                PermissionID = objDto.PermissionID,
                AccountRolePermissionCreatedAt = DateTime.UtcNow
            };

            _context.AccountRolePermissions.Add(accountRolePermission);
            await _context.SaveChangesAsync();

            await _context.Entry(accountRolePermission).Reference(x => x.AccountRole).LoadAsync();
            await _context.Entry(accountRolePermission).Reference(x => x.Permission).LoadAsync();

            return ServiceResult<AccountRolePermissionResponseDto>.Success(
                ToResponseDto(accountRolePermission),
                "Account role permission created successfully.");
        }

        public async Task<ServiceResult<AccountRolePermissionResponseDto>> UpdateAsync(int id, AccountRolePermissionUpdateRequestDto objDto)
        {
            var accountRolePermission = await _context.AccountRolePermissions
                .Include(x => x.AccountRole)
                .Include(x => x.Permission)
                .FirstOrDefaultAsync(x => x.AccountRolePermissionID == id);

            if (accountRolePermission == null)
            {
                return ServiceResult<AccountRolePermissionResponseDto>.NotFound("Account role permission not found.");
            }

            var validationError = await ValidateRolePermissionAsync(objDto.AccountRoleID, objDto.PermissionID);
            if (validationError != null)
            {
                return ServiceResult<AccountRolePermissionResponseDto>.BadRequest(validationError);
            }

            var exists = await _context.AccountRolePermissions.AnyAsync(x =>
                x.AccountRolePermissionID != id &&
                x.AccountRoleID == objDto.AccountRoleID &&
                x.PermissionID == objDto.PermissionID);

            if (exists)
            {
                return ServiceResult<AccountRolePermissionResponseDto>.BadRequest("This role already has this permission.");
            }

            accountRolePermission.AccountRoleID = objDto.AccountRoleID;
            accountRolePermission.PermissionID = objDto.PermissionID;

            await _context.SaveChangesAsync();

            await _context.Entry(accountRolePermission).Reference(x => x.AccountRole).LoadAsync();
            await _context.Entry(accountRolePermission).Reference(x => x.Permission).LoadAsync();

            return ServiceResult<AccountRolePermissionResponseDto>.Success(
                ToResponseDto(accountRolePermission),
                "Account role permission updated successfully.");
        }

        public async Task<ServiceResult<AccountRolePermissionResponseDto>> GetByIdAsync(int id)
        {
            var accountRolePermission = await _context.AccountRolePermissions
                .AsNoTracking()
                .Include(x => x.AccountRole)
                .Include(x => x.Permission)
                .Where(x => x.AccountRolePermissionID == id)
                .Select(x => new AccountRolePermissionResponseDto
                {
                    AccountRolePermissionID = x.AccountRolePermissionID,
                    AccountRoleID = x.AccountRoleID,
                    AccountRoleName = x.AccountRole.AccountRoleName,
                    PermissionID = x.PermissionID,
                    PermissionName = x.Permission.PermissionName,
                    PermissionDescription = x.Permission.PermissionDescription,
                    PermissionGroup = x.Permission.PermissionGroup,
                    AccountRolePermissionCreatedAt = x.AccountRolePermissionCreatedAt
                })
                .FirstOrDefaultAsync();

            if (accountRolePermission == null)
            {
                return ServiceResult<AccountRolePermissionResponseDto>.NotFound("Account role permission not found.");
            }

            return ServiceResult<AccountRolePermissionResponseDto>.Success(accountRolePermission);
        }

        public async Task<ServiceResult<List<AccountRolePermissionResponseDto>>> GetAllAsync()
        {
            var accountRolePermissions = await _context.AccountRolePermissions
                .AsNoTracking()
                .Include(x => x.AccountRole)
                .Include(x => x.Permission)
                .Select(x => new AccountRolePermissionResponseDto
                {
                    AccountRolePermissionID = x.AccountRolePermissionID,
                    AccountRoleID = x.AccountRoleID,
                    AccountRoleName = x.AccountRole.AccountRoleName,
                    PermissionID = x.PermissionID,
                    PermissionName = x.Permission.PermissionName,
                    PermissionDescription = x.Permission.PermissionDescription,
                    PermissionGroup = x.Permission.PermissionGroup,
                    AccountRolePermissionCreatedAt = x.AccountRolePermissionCreatedAt
                })
                .ToListAsync();

            return ServiceResult<List<AccountRolePermissionResponseDto>>.Success(
                accountRolePermissions,
                "Account role permissions loaded successfully.");
        }

        public async Task<ServiceResult<bool>> DeleteAsync(int id)
        {
            var accountRolePermission = await _context.AccountRolePermissions
                .FirstOrDefaultAsync(x => x.AccountRolePermissionID == id);

            if (accountRolePermission == null)
            {
                return ServiceResult<bool>.NotFound("Account role permission not found.");
            }

            _context.AccountRolePermissions.Remove(accountRolePermission);
            await _context.SaveChangesAsync();

            return ServiceResult<bool>.Success(true, "Account role permission deleted successfully.");
        }

        private async Task<string?> ValidateRolePermissionAsync(int accountRoleId, int permissionId)
        {
            if (accountRoleId <= 0)
            {
                return "Account role is required.";
            }

            if (permissionId <= 0)
            {
                return "Permission is required.";
            }

            var roleExists = await _context.AccountRoles.AnyAsync(x => x.AccountRoleID == accountRoleId);
            if (!roleExists)
            {
                return "Account role not found.";
            }

            var permissionExists = await _context.Permissions.AnyAsync(x => x.PermissionID == permissionId);
            if (!permissionExists)
            {
                return "Permission not found.";
            }

            return null;
        }

        private static AccountRolePermissionResponseDto ToResponseDto(AccountRolePermission item)
        {
            return new AccountRolePermissionResponseDto
            {
                AccountRolePermissionID = item.AccountRolePermissionID,
                AccountRoleID = item.AccountRoleID,
                AccountRoleName = item.AccountRole?.AccountRoleName ?? string.Empty,
                PermissionID = item.PermissionID,
                PermissionName = item.Permission?.PermissionName ?? string.Empty,
                PermissionDescription = item.Permission?.PermissionDescription,
                PermissionGroup = item.Permission?.PermissionGroup,
                AccountRolePermissionCreatedAt = item.AccountRolePermissionCreatedAt
            };
        }
    }
}
