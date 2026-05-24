using AutoKosova.Business.DTOs.ExternalCarRequests;
using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.EntityFrameworkCore;

namespace AutoKosova.Business.Services
{
    public class ExternalCarRequestService
    {
        private static readonly HashSet<string> ValidStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "Pending",
            "Contacted",
            "InProgress",
            "Approved",
            "Rejected",
            "Completed"
        };

        private static readonly HashSet<string> ValidCustomerDecisions = new(StringComparer.OrdinalIgnoreCase)
        {
            "Pending",
            "Interested",
            "Declined"
        };

        private readonly AppDbContext _context;

        public ExternalCarRequestService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<ExternalCarRequestResponseDto>> CreateAsync(int accountId, ExternalCarRequestCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.ExternalCarID))
            {
                return ServiceResult<ExternalCarRequestResponseDto>.BadRequest("External car id is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.CarName))
            {
                return ServiceResult<ExternalCarRequestResponseDto>.BadRequest("Car name is required.");
            }

            var account = await _context.Accounts
                .FirstOrDefaultAsync(account => account.AccountID == accountId && !account.AccountDeleted);

            if (account == null)
            {
                return ServiceResult<ExternalCarRequestResponseDto>.Unauthorized("Invalid account.");
            }

            var request = new ExternalCarRequest
            {
                AccountID = accountId,
                ExternalCarID = dto.ExternalCarID.Trim(),
                Source = Normalize(dto.Source) ?? "Carapis",
                CarName = dto.CarName.Trim(),
                Brand = Normalize(dto.Brand),
                Model = Normalize(dto.Model),
                Year = dto.Year,
                Price = dto.Price,
                Currency = Normalize(dto.Currency),
                Mileage = dto.Mileage,
                ImageUrl = Normalize(dto.ImageUrl),
                DetailUrl = Normalize(dto.DetailUrl),
                CustomerName = Normalize(dto.CustomerName),
                CustomerEmail = Normalize(dto.CustomerEmail),
                CustomerPhone = Normalize(dto.CustomerPhone),
                Message = Normalize(dto.Message),
                Status = "Pending",
                CustomerDecision = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.ExternalCarRequests.Add(request);
            await _context.SaveChangesAsync();

            await _context.Entry(request).Reference(x => x.Account).LoadAsync();

            return ServiceResult<ExternalCarRequestResponseDto>.Success(
                ToResponseDto(request),
                "External car request created successfully.");
        }

        public async Task<ServiceResult<List<ExternalCarRequestResponseDto>>> GetAllAsync()
        {
            var requests = await BaseQuery()
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return ServiceResult<List<ExternalCarRequestResponseDto>>.Success(
                requests.Select(ToResponseDto).ToList());
        }

        public async Task<ServiceResult<List<ExternalCarRequestResponseDto>>> GetMyRequestsAsync(int accountId)
        {
            var requests = await BaseQuery()
                .Where(x => x.AccountID == accountId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return ServiceResult<List<ExternalCarRequestResponseDto>>.Success(
                requests.Select(ToResponseDto).ToList());
        }

        public async Task<ServiceResult<ExternalCarRequestResponseDto>> GetByIdAsync(int id)
        {
            var request = await BaseQuery()
                .FirstOrDefaultAsync(x => x.ExternalCarRequestID == id);

            if (request == null)
            {
                return ServiceResult<ExternalCarRequestResponseDto>.NotFound("External car request not found.");
            }

            return ServiceResult<ExternalCarRequestResponseDto>.Success(ToResponseDto(request));
        }

        public async Task<ServiceResult<ExternalCarRequestResponseDto>> UpdateStatusAsync(
            int id,
            int reviewedByAccountId,
            ExternalCarRequestStatusUpdateDto dto)
        {
            var status = Normalize(dto.Status);
            if (status == null || !ValidStatuses.Contains(status))
            {
                return ServiceResult<ExternalCarRequestResponseDto>.BadRequest(
                    $"Status must be one of: {string.Join(", ", ValidStatuses)}.");
            }

            var request = await _context.ExternalCarRequests
                .Include(x => x.Account)
                .Include(x => x.ReviewedByAccount)
                .FirstOrDefaultAsync(x => x.ExternalCarRequestID == id);

            if (request == null)
            {
                return ServiceResult<ExternalCarRequestResponseDto>.NotFound("External car request not found.");
            }

            request.Status = ToCanonicalStatus(status);
            request.Price = dto.Price;
            request.Currency = Normalize(dto.Currency) ?? request.Currency ?? "EUR";
            request.AdminComment = Normalize(dto.AdminComment);
            request.ReviewedByAccountID = reviewedByAccountId;
            request.ReviewedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await _context.Entry(request).Reference(x => x.ReviewedByAccount).LoadAsync();

            return ServiceResult<ExternalCarRequestResponseDto>.Success(
                ToResponseDto(request),
                "External car request status updated successfully.");
        }

        public async Task<ServiceResult<ExternalCarRequestResponseDto>> UpdateCustomerDecisionAsync(
            int id,
            int accountId,
            ExternalCarRequestDecisionDto dto)
        {
            var decision = Normalize(dto.Decision);
            if (decision == null || !ValidCustomerDecisions.Contains(decision) || decision == "Pending")
            {
                return ServiceResult<ExternalCarRequestResponseDto>.BadRequest("Decision must be Interested or Declined.");
            }

            var request = await _context.ExternalCarRequests
                .Include(x => x.Account)
                .Include(x => x.ReviewedByAccount)
                .FirstOrDefaultAsync(x => x.ExternalCarRequestID == id && x.AccountID == accountId);

            if (request == null)
            {
                return ServiceResult<ExternalCarRequestResponseDto>.NotFound("External car request not found.");
            }

            if (!request.Price.HasValue)
            {
                return ServiceResult<ExternalCarRequestResponseDto>.BadRequest("This request does not have a price offer yet.");
            }

            request.CustomerDecision = ToCanonicalDecision(decision);
            request.CustomerDecisionAt = DateTime.UtcNow;

            if (request.CustomerDecision == "Interested")
            {
                request.Status = "Contacted";
            }
            else if (request.CustomerDecision == "Declined")
            {
                request.Status = "Rejected";
            }

            await _context.SaveChangesAsync();

            return ServiceResult<ExternalCarRequestResponseDto>.Success(
                ToResponseDto(request),
                request.CustomerDecision == "Interested"
                    ? "Thank you. Our team will contact you about this car."
                    : "Your decision was saved.");
        }

        private IQueryable<ExternalCarRequest> BaseQuery()
        {
            return _context.ExternalCarRequests
                .AsNoTracking()
                .Include(x => x.Account)
                .Include(x => x.ReviewedByAccount);
        }

        private static string? Normalize(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        private static string ToCanonicalStatus(string status)
        {
            return ValidStatuses.First(validStatus => string.Equals(validStatus, status, StringComparison.OrdinalIgnoreCase));
        }

        private static string ToCanonicalDecision(string decision)
        {
            return ValidCustomerDecisions.First(validDecision => string.Equals(validDecision, decision, StringComparison.OrdinalIgnoreCase));
        }

        private static ExternalCarRequestResponseDto ToResponseDto(ExternalCarRequest request)
        {
            return new ExternalCarRequestResponseDto
            {
                ExternalCarRequestID = request.ExternalCarRequestID,
                AccountID = request.AccountID,
                AccountUsername = request.Account?.AccountUsername ?? string.Empty,
                AccountEmail = request.Account?.AccountEmail ?? string.Empty,
                ReviewedByAccountID = request.ReviewedByAccountID,
                ReviewedByUsername = request.ReviewedByAccount?.AccountUsername,
                ExternalCarID = request.ExternalCarID,
                Source = request.Source,
                CarName = request.CarName,
                Brand = request.Brand,
                Model = request.Model,
                Year = request.Year,
                Price = request.Price,
                Currency = request.Currency,
                Mileage = request.Mileage,
                ImageUrl = request.ImageUrl,
                DetailUrl = request.DetailUrl,
                CustomerName = request.CustomerName,
                CustomerEmail = request.CustomerEmail,
                CustomerPhone = request.CustomerPhone,
                Message = request.Message,
                Status = request.Status,
                AdminComment = request.AdminComment,
                CustomerDecision = request.CustomerDecision,
                CustomerDecisionAt = request.CustomerDecisionAt,
                CreatedAt = request.CreatedAt,
                ReviewedAt = request.ReviewedAt
            };
        }
    }
}
