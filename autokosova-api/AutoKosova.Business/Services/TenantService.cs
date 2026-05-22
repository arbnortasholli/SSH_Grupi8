using AutoKosova.Business.DTOs.Tenants;
using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.EntityFrameworkCore;

namespace AutoKosova.Business.Services
{
    public class TenantService
    {
        private readonly AppDbContext _context;

        public TenantService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<List<TenantResponseDto>>> GetAllAsync()
        {
            var tenants = await _context.Tenants
                .AsNoTracking()
                .Include(x => x.OwnerAccount)
                .OrderByDescending(x => x.TenantCreationDate)
                .Select(x => ToResponseDto(x))
                .ToListAsync();

            return ServiceResult<List<TenantResponseDto>>.Success(tenants, "Tenants u moren me sukses.");
        }

        public async Task<ServiceResult<TenantResponseDto>> GetByIdAsync(int id)
        {
            var tenant = await _context.Tenants
                .AsNoTracking()
                .Include(x => x.OwnerAccount)
                .FirstOrDefaultAsync(x => x.TenantID == id);

            if (tenant == null)
            {
                return ServiceResult<TenantResponseDto>.NotFound("Tenant nuk u gjet.");
            }

            return ServiceResult<TenantResponseDto>.Success(ToResponseDto(tenant));
        }

        public async Task<ServiceResult<TenantResponseDto>> CreateAsync(TenantCreateRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.TenantName))
            {
                return ServiceResult<TenantResponseDto>.BadRequest("Tenant name is required.");
            }

            if (dto.OwnerAccountID.HasValue)
            {
                var ownerExists = await _context.Accounts
                    .AnyAsync(x => x.AccountID == dto.OwnerAccountID.Value && !x.AccountDeleted);

                if (!ownerExists)
                {
                    return ServiceResult<TenantResponseDto>.BadRequest("Owner account does not exist.");
                }
            }

            var tenant = new Tenant
            {
                OwnerAccountID = dto.OwnerAccountID,
                TenantName = dto.TenantName.Trim(),
                TenantBusinessNumber = dto.TenantBusinessNumber?.Trim(),
                TenantEmail = dto.TenantEmail?.Trim(),
                TenantPhoneNumber = dto.TenantPhoneNumber?.Trim(),
                TenantCity = dto.TenantCity?.Trim(),
                TenantAddress = dto.TenantAddress?.Trim(),
                TenantIsActive = dto.TenantIsActive,
                TenantCreationDate = DateTime.UtcNow
            };

            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync();

            await _context.Entry(tenant).Reference(x => x.OwnerAccount).LoadAsync();

            return ServiceResult<TenantResponseDto>.Success(ToResponseDto(tenant), "Tenant u krijua me sukses.");
        }

        public async Task<ServiceResult<TenantResponseDto>> UpdateAsync(int id, TenantUpdateRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.TenantName))
            {
                return ServiceResult<TenantResponseDto>.BadRequest("Tenant name is required.");
            }

            var tenant = await _context.Tenants
                .Include(x => x.OwnerAccount)
                .FirstOrDefaultAsync(x => x.TenantID == id);

            if (tenant == null)
            {
                return ServiceResult<TenantResponseDto>.NotFound("Tenant nuk u gjet.");
            }

            if (dto.OwnerAccountID.HasValue)
            {
                var ownerExists = await _context.Accounts
                    .AnyAsync(x => x.AccountID == dto.OwnerAccountID.Value && !x.AccountDeleted);

                if (!ownerExists)
                {
                    return ServiceResult<TenantResponseDto>.BadRequest("Owner account does not exist.");
                }
            }

            tenant.OwnerAccountID = dto.OwnerAccountID;
            tenant.TenantName = dto.TenantName.Trim();
            tenant.TenantBusinessNumber = dto.TenantBusinessNumber?.Trim();
            tenant.TenantEmail = dto.TenantEmail?.Trim();
            tenant.TenantPhoneNumber = dto.TenantPhoneNumber?.Trim();
            tenant.TenantCity = dto.TenantCity?.Trim();
            tenant.TenantAddress = dto.TenantAddress?.Trim();
            tenant.TenantIsActive = dto.TenantIsActive;

            await _context.SaveChangesAsync();
            await _context.Entry(tenant).Reference(x => x.OwnerAccount).LoadAsync();

            return ServiceResult<TenantResponseDto>.Success(ToResponseDto(tenant), "Tenant u perditesua me sukses.");
        }

        public async Task<ServiceResult<bool>> DeleteAsync(int id)
        {
            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(x => x.TenantID == id);

            if (tenant == null)
            {
                return ServiceResult<bool>.NotFound("Tenant nuk u gjet.");
            }

            tenant.TenantIsActive = false;
            await _context.SaveChangesAsync();

            return ServiceResult<bool>.Success(true, "Tenant u deaktivizua me sukses.");
        }

        private static TenantResponseDto ToResponseDto(Tenant tenant)
        {
            return new TenantResponseDto
            {
                TenantID = tenant.TenantID,
                OwnerAccountID = tenant.OwnerAccountID,
                OwnerUsername = tenant.OwnerAccount?.AccountUsername,
                OwnerEmail = tenant.OwnerAccount?.AccountEmail,
                TenantName = tenant.TenantName,
                TenantBusinessNumber = tenant.TenantBusinessNumber,
                TenantEmail = tenant.TenantEmail,
                TenantPhoneNumber = tenant.TenantPhoneNumber,
                TenantCity = tenant.TenantCity,
                TenantAddress = tenant.TenantAddress,
                TenantIsActive = tenant.TenantIsActive,
                TenantCreationDate = tenant.TenantCreationDate
            };
        }
    }
}
