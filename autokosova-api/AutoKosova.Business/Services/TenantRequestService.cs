using AutoKosova.Business.DTOs.TenantRequests;
using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.EntityFrameworkCore;

namespace AutoKosova.Business.Services
{
    public class TenantRequestService
    {
        private const string Pending = "Pending";
        private const string Approved = "Approved";
        private const string Rejected = "Rejected";

        private readonly AppDbContext _context;

        public TenantRequestService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<TenantRequestResponseDto>> CreateAsync(int accountId, TenantRequestCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.BusinessName))
            {
                return ServiceResult<TenantRequestResponseDto>.BadRequest("Business name is required.");
            }

            var account = await _context.Accounts
                .Include(x => x.Tenant)
                .FirstOrDefaultAsync(x => x.AccountID == accountId && !x.AccountDeleted);

            if (account == null)
            {
                return ServiceResult<TenantRequestResponseDto>.Unauthorized("Invalid account.");
            }

            if (account.TenantID.HasValue)
            {
                return ServiceResult<TenantRequestResponseDto>.BadRequest("This account is already linked to a tenant.");
            }

            var hasPendingRequest = await _context.TenantRequests
                .AnyAsync(x => x.AccountID == accountId && x.Status == Pending);

            if (hasPendingRequest)
            {
                return ServiceResult<TenantRequestResponseDto>.BadRequest("You already have a pending tenant request.");
            }

            var request = new TenantRequest
            {
                AccountID = accountId,
                BusinessName = dto.BusinessName.Trim(),
                BusinessNumber = dto.BusinessNumber?.Trim(),
                BusinessEmail = dto.BusinessEmail?.Trim(),
                BusinessPhoneNumber = dto.BusinessPhoneNumber?.Trim(),
                BusinessCity = dto.BusinessCity?.Trim(),
                BusinessAddress = dto.BusinessAddress?.Trim(),
                Message = dto.Message?.Trim(),
                Status = Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.TenantRequests.Add(request);
            await _context.SaveChangesAsync();

            await _context.Entry(request).Reference(x => x.Account).LoadAsync();

            return ServiceResult<TenantRequestResponseDto>.Success(ToResponseDto(request), "Tenant request created successfully.");
        }

        public async Task<ServiceResult<List<TenantRequestResponseDto>>> GetAllAsync()
        {
            var requests = await BaseQuery()
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return ServiceResult<List<TenantRequestResponseDto>>.Success(requests.Select(ToResponseDto).ToList());
        }

        public async Task<ServiceResult<List<TenantRequestResponseDto>>> GetMyRequestsAsync(int accountId)
        {
            var requests = await BaseQuery()
                .Where(x => x.AccountID == accountId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return ServiceResult<List<TenantRequestResponseDto>>.Success(requests.Select(ToResponseDto).ToList());
        }

        public async Task<ServiceResult<TenantRequestResponseDto>> GetByIdAsync(int id)
        {
            var request = await BaseQuery()
                .FirstOrDefaultAsync(x => x.TenantRequestID == id);

            if (request == null)
            {
                return ServiceResult<TenantRequestResponseDto>.NotFound("Tenant request not found.");
            }

            return ServiceResult<TenantRequestResponseDto>.Success(ToResponseDto(request));
        }

        public async Task<ServiceResult<TenantRequestResponseDto>> ReviewAsync(int id, int adminAccountId, TenantRequestReviewDto dto)
        {
            var status = dto.Status.Trim();

            if (status != Approved && status != Rejected)
            {
                return ServiceResult<TenantRequestResponseDto>.BadRequest("Status must be Approved or Rejected.");
            }

            var request = await _context.TenantRequests
                .Include(x => x.Account)
                .Include(x => x.ReviewedByAccount)
                .Include(x => x.CreatedTenant)
                .FirstOrDefaultAsync(x => x.TenantRequestID == id);

            if (request == null)
            {
                return ServiceResult<TenantRequestResponseDto>.NotFound("Tenant request not found.");
            }

            if (request.Status != Pending)
            {
                return ServiceResult<TenantRequestResponseDto>.BadRequest("Only pending tenant requests can be reviewed.");
            }

            if (request.Account == null || request.Account.AccountDeleted)
            {
                return ServiceResult<TenantRequestResponseDto>.BadRequest("Request account is not valid.");
            }

            request.Status = status;
            request.AdminComment = dto.AdminComment?.Trim();
            request.ReviewedByAccountID = adminAccountId;
            request.ReviewedAt = DateTime.UtcNow;

            if (status == Approved)
            {
                var sellerRole = await _context.AccountRoles
                    .FirstOrDefaultAsync(x => x.AccountRoleName == "Seller");

                if (sellerRole == null)
                {
                    return ServiceResult<TenantRequestResponseDto>.BadRequest("Seller role does not exist.");
                }

                var tenant = new Tenant
                {
                    OwnerAccountID = request.AccountID,
                    TenantName = request.BusinessName,
                    TenantBusinessNumber = request.BusinessNumber,
                    TenantEmail = request.BusinessEmail,
                    TenantPhoneNumber = request.BusinessPhoneNumber,
                    TenantCity = request.BusinessCity,
                    TenantAddress = request.BusinessAddress,
                    TenantIsActive = true,
                    TenantCreationDate = DateTime.UtcNow
                };

                _context.Tenants.Add(tenant);
                await _context.SaveChangesAsync();

                request.Account.TenantID = tenant.TenantID;
                request.Account.AccountRoleID = sellerRole.AccountRoleID;
                request.CreatedTenantID = tenant.TenantID;
            }

            await _context.SaveChangesAsync();

            await _context.Entry(request).Reference(x => x.ReviewedByAccount).LoadAsync();
            await _context.Entry(request).Reference(x => x.CreatedTenant).LoadAsync();

            return ServiceResult<TenantRequestResponseDto>.Success(ToResponseDto(request), "Tenant request reviewed successfully.");
        }

        private IQueryable<TenantRequest> BaseQuery()
        {
            return _context.TenantRequests
                .AsNoTracking()
                .Include(x => x.Account)
                .Include(x => x.ReviewedByAccount)
                .Include(x => x.CreatedTenant);
        }

        private static TenantRequestResponseDto ToResponseDto(TenantRequest request)
        {
            return new TenantRequestResponseDto
            {
                TenantRequestID = request.TenantRequestID,
                AccountID = request.AccountID,
                AccountUsername = request.Account?.AccountUsername ?? string.Empty,
                AccountEmail = request.Account?.AccountEmail ?? string.Empty,
                ReviewedByAccountID = request.ReviewedByAccountID,
                ReviewedByUsername = request.ReviewedByAccount?.AccountUsername,
                CreatedTenantID = request.CreatedTenantID,
                BusinessName = request.BusinessName,
                BusinessNumber = request.BusinessNumber,
                BusinessEmail = request.BusinessEmail,
                BusinessPhoneNumber = request.BusinessPhoneNumber,
                BusinessCity = request.BusinessCity,
                BusinessAddress = request.BusinessAddress,
                Message = request.Message,
                Status = request.Status,
                AdminComment = request.AdminComment,
                CreatedAt = request.CreatedAt,
                ReviewedAt = request.ReviewedAt
            };
        }
    }
}
