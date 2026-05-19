using AutoKosova.Business.DTOs.AccountRole;
using AutoKosova.Business.DTOs.AccountsRolePermission;
using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

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
            var objAccountRolePermission = new AccountRolePermission
            {
                AccountRoleID = objDto.AccountRoleID,
                PermissionID = objDto.PermissionID
            };

            _context.AccountRolePermissions.Add(objAccountRolePermission);
            await _context.SaveChangesAsync();

            var response = new AccountRolePermissionResponseDto
            {
                AccountRoleID = objAccountRolePermission.AccountRoleID,
                PermissionID = objAccountRolePermission.PermissionID
            };

            return ServiceResult<AccountRolePermissionResponseDto>.Success(response, "U krijua ne db me suskses");

        }

        public async Task<ServiceResult<AccountRolePermissionResponseDto>> UpdateAsync(int id, AccountRolePermissionCreateRequestDto objDto)
        {
            var accountRolePermission = await _context.AccountRolePermissions
                .FirstOrDefaultAsync(x => x.AccountRolePermissionID == id);

            if(accountRolePermission == null)
            {
                return ServiceResult<AccountRolePermissionResponseDto>.NotFound("Account Permission Not Found");
            }

            accountRolePermission.PermissionID = objDto.PermissionID;
            accountRolePermission.AccountRoleID = objDto.AccountRoleID;

            await _context.SaveChangesAsync();

            var response = new AccountRolePermissionResponseDto
            {
                AccountRoleID = accountRolePermission.PermissionID,
                PermissionID = accountRolePermission.AccountRoleID
            };

            return ServiceResult<AccountRolePermissionResponseDto>.Success(response, "AccountRolePermission u be update me sukses!");
        }

        public async Task<ServiceResult<AccountRolePermissionResponseDto>> GetByIdAsync(int id)
        {
            var accountRolePermission = await _context.AccountRolePermissions
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.AccountRolePermissionID == id);

            if(accountRolePermission == null)
            {
                return ServiceResult<AccountRolePermissionResponseDto>.NotFound("Nuk u gjet Account Role Permission");
            }

            var result = new AccountRolePermissionResponseDto
            {
                AccountRolePermissionID = accountRolePermission.AccountRolePermissionID,
                PermissionID = accountRolePermission.PermissionID,
                AccountRoleID = accountRolePermission.AccountRoleID
            };

            return ServiceResult<AccountRolePermissionResponseDto>.Success(result, "Account Permissionn u morr me sukses");
        }

        //public async Task<ServiceResult<List<AccountRolePermissionResponseDto>>> GetAllAsync()
        //{
        //    var accountRolePermission = await _context.AccountRolePermissions
        //        .

        //}
    }
}
