using AutoKosova.Business.DTOs.Permission;
using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace AutoKosova.Business.Services
{
    public class PermissionService
    {

        private readonly AppDbContext _context;

        public PermissionService(AppDbContext context)
        {
            _context = context;
        }



        public async Task<ServiceResult<PermissionResponseDto>> CreateAsync(PermissionCreateRequestDto objDto)
        {
            if (string.IsNullOrWhiteSpace(objDto.PermissionName))
            {
                return ServiceResult<PermissionResponseDto>.BadRequest("Emri i permission eshte i detyruar!");
            }

            var exists = await _context.Permissions
                .AnyAsync(x => x.PermissionName == objDto.PermissionName);

            if (exists)
            {
                return ServiceResult<PermissionResponseDto>.BadRequest("Permission ekziston tashme!");
            }

            var permission = new Permission
            {
                PermissionName = objDto.PermissionName,
                PermissionDescription = objDto.PermissionDescription,
                PermissionGroup = objDto.PermissionGroup,
                PersmissionIsActive = true
            };

            _context.Permissions.Add(permission);
            await _context.SaveChangesAsync();

            var response = new PermissionResponseDto
            {
                PermissionID = permission.PermissionID,
                PermissionName = permission.PermissionName,
                PermissionDescription = permission.PermissionDescription,
                PermissionGroup = permission.PermissionGroup,
                PersmissionIsActive = permission.PersmissionIsActive
            };

            return ServiceResult<PermissionResponseDto>.Success(response, "Permission created successfully.");
        }

        public async Task<ServiceResult<PermissionResponseDto>> UpdateAsync(int id, PermissionUpdateRequestDto objDto)
        {
            var permission = await _context.Permissions
                .FirstOrDefaultAsync(x => x.PermissionID == id);
            
            if(permission == null)
            {
                return ServiceResult<PermissionResponseDto>.NotFound("Permission nuk u gjet!");
            }

            if (string.IsNullOrWhiteSpace(permission.PermissionName))
            {
                return ServiceResult<PermissionResponseDto>.BadRequest("Emri i permission nuk duhet te jete null!");
            }

            var exists = await _context.Permissions
                .AnyAsync(x =>
                    x.PermissionID != id &&
                    x.PermissionName == objDto.PermissionName.Trim());

            if (exists)
            {
                return ServiceResult<PermissionResponseDto>.BadRequest("Ky emër ekziston, nuk lejohet update.");
            }

            permission.PermissionName = objDto.PermissionName.Trim();
            permission.PermissionDescription = objDto.PermissionDescription?.Trim();
            permission.PermissionGroup = objDto.PermissionGroup?.Trim();
            permission.PersmissionIsActive = objDto.PersmissionIsActive;

            await _context.SaveChangesAsync();

            var response = new PermissionResponseDto
            {
                PermissionID = permission.PermissionID,
                PermissionName = permission.PermissionName,
                PermissionDescription = permission.PermissionDescription,
                PermissionGroup = permission.PermissionGroup,
                PersmissionIsActive = permission.PersmissionIsActive
            };

            return ServiceResult<PermissionResponseDto>.Success(response, "Permission updated successfully.");
        }

        public async Task<ServiceResult<bool>> DeleteAsync(int id)
        {
            var permission = await _context.Permissions
                .FirstOrDefaultAsync(x => x.PermissionID == id);

            if(permission == null)
            {
                return ServiceResult<bool>.NotFound("Permission nuk u gjet!");
            }

            _context.Permissions.Remove(permission);

            await _context.SaveChangesAsync();


            return ServiceResult<bool>.Success(true, "Permission deleted successfully.");
        }

        public async Task<ServiceResult<List<PermissionResponseDto>>> GetAllAsync()
        {
            var permissions = await _context.Permissions
                .AsNoTracking()
                .Select(x => new PermissionResponseDto
                {
                    PermissionID = x.PermissionID,
                    PermissionName = x.PermissionName,
                    PermissionDescription = x.PermissionDescription,
                    PermissionGroup = x.PermissionGroup,
                    PersmissionIsActive = x.PersmissionIsActive
                })
                .ToListAsync();

            return ServiceResult<List<PermissionResponseDto>>.Success(permissions);

        }

        public async Task<ServiceResult<PermissionResponseDto>> GetByIdAsync(int id)
        {
            var permission = await _context.Permissions
                .AsNoTracking()
                .Where(x => x.PermissionID == id)
                .Select(x => new PermissionResponseDto
                {
                    PermissionID = x.PermissionID,
                    PermissionName = x.PermissionName,
                    PermissionDescription = x.PermissionDescription,
                    PermissionGroup = x.PermissionGroup,
                    PersmissionIsActive = x.PersmissionIsActive
                })
                .FirstOrDefaultAsync();

            if(permission == null)
            {
                return ServiceResult<PermissionResponseDto>.NotFound("Nuk u gjet permission!");
            }

            return ServiceResult<PermissionResponseDto>.Success(permission);
        }
    }
    
}
