using AutoKosova.DataAccess;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    [Authorize(Roles = "SuperAdmin")]
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<ActionResult<DashboardSummaryResponse>> GetSummary()
        {
            var today = DateTime.UtcNow.Date;
            var monthStart = new DateTime(today.Year, today.Month, 1);

            var carsQuery = _context.Cars.AsNoTracking().Where(car => !car.CarDeleted);
            var accountsQuery = _context.Accounts.AsNoTracking().Where(account => !account.AccountDeleted);
            var bookingsQuery = _context.RentalBookings.AsNoTracking().Where(booking => !booking.RentalBookingDeleted);
            var paymentsQuery = _context.PaymentOrders.AsNoTracking().Include(payment => payment.PaymentStatus);

            var recentCars = await carsQuery
                .OrderByDescending(car => car.CarCreationDate)
                .Take(5)
                .Select(car => new DashboardRecentCarDto
                {
                    CarsID = car.CarsID,
                    Title = car.CarTitle,
                    Brand = car.CarBrand,
                    Model = car.CarModel,
                    Year = car.CarYear,
                    Status = car.CarStatus,
                    CreatedAt = car.CarCreationDate
                })
                .ToListAsync();

            var recentTenantRequests = await _context.TenantRequests
                .AsNoTracking()
                .OrderByDescending(request => request.CreatedAt)
                .Take(5)
                .Select(request => new DashboardRecentTenantRequestDto
                {
                    TenantRequestID = request.TenantRequestID,
                    BusinessName = request.BusinessName,
                    BusinessCity = request.BusinessCity,
                    Status = request.Status,
                    CreatedAt = request.CreatedAt
                })
                .ToListAsync();

            var recentBookings = await bookingsQuery
                .OrderByDescending(booking => booking.RentalBookingCreationDate)
                .Take(5)
                .Select(booking => new DashboardRecentBookingDto
                {
                    RentalBookingID = booking.RentalBookingID,
                    CarID = booking.CarID,
                    CustomerAccountID = booking.CustomerAccountID,
                    Status = booking.RentalBookingStatus,
                    TotalPrice = booking.RentalBookingTotalPrice,
                    CreatedAt = booking.RentalBookingCreationDate
                })
                .ToListAsync();

            var summary = new DashboardSummaryResponse
            {
                TotalCars = await carsQuery.CountAsync(),
                CarsForSale = await carsQuery.CountAsync(car => car.IsForSale),
                CarsForRent = await carsQuery.CountAsync(car => car.IsForRent),
                AvailableCars = await carsQuery.CountAsync(car => car.CarStatus == "Available"),
                TotalAccounts = await accountsQuery.CountAsync(),
                ActiveAccounts = await accountsQuery.CountAsync(account => account.AccountIsActive),
                ActiveTenants = await _context.Tenants.AsNoTracking().CountAsync(tenant => tenant.TenantIsActive),
                PendingTenantRequests = await _context.TenantRequests.AsNoTracking().CountAsync(request => request.Status == "Pending"),
                ActiveBookings = await bookingsQuery.CountAsync(booking =>
                    booking.RentalBookingStatus == "Confirmed" ||
                    booking.RentalBookingStatus == "PendingPayment"),
                BookingsThisMonth = await bookingsQuery.CountAsync(booking => booking.RentalBookingCreationDate >= monthStart),
                PendingPayments = await paymentsQuery.CountAsync(payment =>
                    payment.PaymentStatus != null &&
                    (payment.PaymentStatus.PaymentStatusName == "Pending" ||
                     payment.PaymentStatus.PaymentStatusName == "PendingPayment")),
                FailedPayments = await paymentsQuery.CountAsync(payment =>
                    payment.PaymentStatus != null &&
                    payment.PaymentStatus.PaymentStatusName == "Failed"),
                RevenueThisMonth = await paymentsQuery
                    .Where(payment => payment.PaidDate >= monthStart)
                    .SumAsync(payment => (decimal?)payment.Amount) ?? 0,
                RecentCars = recentCars,
                RecentTenantRequests = recentTenantRequests,
                RecentBookings = recentBookings
            };

            return Ok(summary);
        }
    }

    public class DashboardSummaryResponse
    {
        public int TotalCars { get; set; }
        public int CarsForSale { get; set; }
        public int CarsForRent { get; set; }
        public int AvailableCars { get; set; }
        public int TotalAccounts { get; set; }
        public int ActiveAccounts { get; set; }
        public int ActiveTenants { get; set; }
        public int PendingTenantRequests { get; set; }
        public int ActiveBookings { get; set; }
        public int BookingsThisMonth { get; set; }
        public int PendingPayments { get; set; }
        public int FailedPayments { get; set; }
        public decimal RevenueThisMonth { get; set; }
        public List<DashboardRecentCarDto> RecentCars { get; set; } = new();
        public List<DashboardRecentTenantRequestDto> RecentTenantRequests { get; set; } = new();
        public List<DashboardRecentBookingDto> RecentBookings { get; set; } = new();
    }

    public class DashboardRecentCarDto
    {
        public int CarsID { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class DashboardRecentTenantRequestDto
    {
        public int TenantRequestID { get; set; }
        public string BusinessName { get; set; } = string.Empty;
        public string? BusinessCity { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class DashboardRecentBookingDto
    {
        public int RentalBookingID { get; set; }
        public int CarID { get; set; }
        public int CustomerAccountID { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
