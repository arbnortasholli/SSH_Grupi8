using AutoKosova.Business.DTOs.AccountRole;
using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace AutoKosova.Business.Services
{
    public class AccountRoleService
    {
        private readonly AppDbContext _context;

        public AccountRoleService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<AccountRoleResponseDto>> CreateAsync(AccountRoleCreateRequestDto objDto)
        {
            if(string.IsNullOrWhiteSpace(objDto.AccountRoleName))
            {
                return ServiceResult<AccountRoleResponseDto>.BadRequest("Emri i Rolit nuk mund te jete i zbrazur!");
            }

            var accountRole = new AccountRole
            {
                AccountRoleName = objDto.AccountRoleName,
                AccountRoleDescription = objDto.AccountRoleDescription
            };

            _context.AccountRoles.Add(accountRole);
            await _context.SaveChangesAsync();

            var response = new AccountRoleResponseDto
            {
                AccountRoleID = accountRole.AccountRoleID,
                AccountRoleName = accountRole.AccountRoleName,
                AccountRoleDescription = accountRole.AccountRoleDescription
            };

            return ServiceResult<AccountRoleResponseDto>.Success(response, "Role u krijua me sukses");
        }

        public async Task<ServiceResult<AccountRoleResponseDto>> UpdateAsync(int id, AccountRoleUpdateRequestDto objDto)
        {
            var accountRole = await _context.AccountRoles
                .FirstOrDefaultAsync(x => x.AccountRoleID == id);

            if(accountRole == null)
            {
                return ServiceResult<AccountRoleResponseDto>.NotFound("Account Role nuk u gjet");
            }

            accountRole.AccountRoleName = objDto.AccountRoleName;
            accountRole.AccountRoleDescription = objDto.AccountRoleDescription;

            await _context.SaveChangesAsync();

            var response = new AccountRoleResponseDto
            {
                AccountRoleName = accountRole.AccountRoleName,
                AccountRoleDescription = accountRole.AccountRoleDescription
            };

            return ServiceResult<AccountRoleResponseDto>.Success(response, "Account Role u be update me sukses!");
        }

        public async Task<ServiceResult<bool>> DeleteAsync(int id)
        {
            var accountRole = await _context.AccountRoles
                .FirstOrDefaultAsync(x => x.AccountRoleID == id);

            if(accountRole == null)
            {
                return ServiceResult<bool>.NotFound("Account Role nuk u gjet");
            }

            _context.AccountRoles.Remove(accountRole);

            await _context.SaveChangesAsync();

            return ServiceResult<bool>.Success(true, "Account Role u fshi me sukses!");
        }

        public async Task<ServiceResult<List<AccountRoleResponseDto>>> GetAllAsync()
        {
            var accountRoles = await _context.AccountRoles
                .AsNoTracking()
                .Select(x => new AccountRoleResponseDto
                {
                    AccountRoleID = x.AccountRoleID,
                    AccountRoleName = x.AccountRoleName,
                    AccountRoleDescription = x.AccountRoleDescription
                })
                .ToListAsync();

            return ServiceResult<List<AccountRoleResponseDto>>.Success(accountRoles, "Account ROles u morren me sukses!");
        }

        public async Task<ServiceResult<AccountRoleResponseDto>> GetByIdAsync(int id)
        {
            var accountRole = await _context.AccountRoles
                .AsNoTracking()
                .Where(x => x.AccountRoleID == id)
                .Select(x => new AccountRoleResponseDto {
                    AccountRoleID = x.AccountRoleID,
                    AccountRoleName = x.AccountRoleName,
                    AccountRoleDescription = x.AccountRoleDescription
                })
                .FirstOrDefaultAsync();

            if(accountRole == null)
            {
                return ServiceResult<AccountRoleResponseDto>.NotFound("Account Role Nuk u gjet");
            }

            return ServiceResult<AccountRoleResponseDto>.Success(accountRole);
        }
    }
}
