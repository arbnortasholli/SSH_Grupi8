using AutoKosova.Business.Models;
using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace AutoKosova.Business.Services
{
    public class RentalBookingService
    {
        private static readonly string[] AllowedStatuses = { "Pending", "Confirmed", "Cancelled", "Completed" };

        private readonly AppDbContext _context;

        public RentalBookingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<List<RentalBookingListModel>>> GetAll(int accountId, string? role)
        {
            var query = _context.RentalBookings
                .Include(rb => rb.Car)
                .Where(rb => !rb.RentalBookingDeleted)
                .AsQueryable();

            if (role != "Admin")
            {
                query = query.Where(rb => rb.Car != null && rb.Car.CreatedByAccountID == accountId);
            }

            var bookings = await query
                .OrderByDescending(rb => rb.RentalBookingCreationDate)
                .Select(ListProjection)
                .ToListAsync();

            return ServiceResult<List<RentalBookingListModel>>.Success(bookings);
        }

        public async Task<ServiceResult<RentalBookingDetailsModel>> GetById(int id, int accountId, string? role)
        {
            var booking = await _context.RentalBookings
                .Include(rb => rb.Car)
                .Include(rb => rb.CustomerAccount)
                .FirstOrDefaultAsync(rb => rb.RentalBookingID == id && !rb.RentalBookingDeleted);

            if (booking == null)
            {
                return ServiceResult<RentalBookingDetailsModel>.NotFound("Rental booking not found.");
            }

            if (!CanAccessBooking(booking, accountId, role))
            {
                return ServiceResult<RentalBookingDetailsModel>.Forbidden("You are not allowed to view this booking.");
            }

            return ServiceResult<RentalBookingDetailsModel>.Success(new RentalBookingDetailsModel
            {
                RentalBookingID = booking.RentalBookingID,
                TenantID = booking.TenantID,
                CarID = booking.CarID,
                CustomerAccountID = booking.CustomerAccountID,
                CustomerUsername = booking.CustomerAccount?.AccountUsername ?? string.Empty,
                CustomerEmail = booking.CustomerAccount?.AccountEmail ?? string.Empty,
                CarTitle = booking.Car?.CarTitle ?? string.Empty,
                CarBrand = booking.Car?.CarBrand ?? string.Empty,
                CarModel = booking.Car?.CarModel ?? string.Empty,
                RentalBookingStartDate = booking.RentalBookingStartDate,
                RentalBookingEndDate = booking.RentalBookingEndDate,
                RentalBookingDailyPrice = booking.RentalBookingDailyPrice,
                RentalBookingTotalPrice = booking.RentalBookingTotalPrice,
                RentalBookingStatus = booking.RentalBookingStatus,
                RentalBookingCreationDate = booking.RentalBookingCreationDate,
                RentalBookingUpdatedDate = booking.RentalBookingUpdatedDate
            });
        }

        public async Task<ServiceResult<RentalBookingCreatedModel>> Create(RentalBookingCreateCommand command, int accountId)
        {
            var validationError = ValidateDates(command.CarID, command.RentalBookingStartDate, command.RentalBookingEndDate);

            if (validationError != null)
            {
                return ServiceResult<RentalBookingCreatedModel>.BadRequest(validationError);
            }

            var car = await _context.Cars
                .Include(c => c.Tenant)
                .FirstOrDefaultAsync(c =>
                    c.CarsID == command.CarID &&
                    !c.CarDeleted &&
                    c.IsForRent);

            if (car == null)
            {
                return ServiceResult<RentalBookingCreatedModel>.NotFound("Car not found or not available for rent.");
            }

            if (!car.TenantID.HasValue)
            {
                return ServiceResult<RentalBookingCreatedModel>.BadRequest("Rental car must belong to a tenant.");
            }

            if (!car.RentalDailyPrice.HasValue || car.RentalDailyPrice.Value <= 0)
            {
                return ServiceResult<RentalBookingCreatedModel>.BadRequest("Car rental daily price is not valid.");
            }

            var startDate = command.RentalBookingStartDate.Date;
            var endDate = command.RentalBookingEndDate.Date;
            var hasConflict = await HasBookingConflict(command.CarID, startDate, endDate);

            if (hasConflict)
            {
                return ServiceResult<RentalBookingCreatedModel>.BadRequest("Car is not available for the selected dates.");
            }

            var totalDays = (endDate - startDate).Days;
            var totalPrice = totalDays * car.RentalDailyPrice.Value;

            var booking = new RentalBooking
            {
                TenantID = car.TenantID.Value,
                CarID = car.CarsID,
                CustomerAccountID = accountId,
                RentalBookingStartDate = startDate,
                RentalBookingEndDate = endDate,
                RentalBookingDailyPrice = car.RentalDailyPrice.Value,
                RentalBookingTotalPrice = totalPrice,
                RentalBookingStatus = "Pending",
                RentalBookingCreationDate = DateTime.UtcNow,
                RentalBookingDeleted = false,
                Tenant = car.Tenant,
                Car = car
            };

            _context.RentalBookings.Add(booking);
            await _context.SaveChangesAsync();

            return ServiceResult<RentalBookingCreatedModel>.Success(new RentalBookingCreatedModel
            {
                RentalBookingID = booking.RentalBookingID,
                TotalDays = totalDays,
                TotalPrice = totalPrice
            });
        }

        public async Task<ServiceResult<List<RentalBookingListModel>>> GetMyBookings(int accountId)
        {
            var bookings = await _context.RentalBookings
                .Include(rb => rb.Car)
                .Where(rb => !rb.RentalBookingDeleted && rb.CustomerAccountID == accountId)
                .OrderByDescending(rb => rb.RentalBookingCreationDate)
                .Select(ListProjection)
                .ToListAsync();

            return ServiceResult<List<RentalBookingListModel>>.Success(bookings);
        }

        public async Task<ServiceResult<CarAvailabilityModel>> CheckAvailability(int carId, DateTime startDate, DateTime endDate)
        {
            var validationError = ValidateDates(carId, startDate, endDate);

            if (validationError != null)
            {
                return ServiceResult<CarAvailabilityModel>.BadRequest(validationError);
            }

            var carExists = await _context.Cars
                .AnyAsync(c => c.CarsID == carId && !c.CarDeleted && c.IsForRent);

            if (!carExists)
            {
                return ServiceResult<CarAvailabilityModel>.NotFound("Car not found or not available for rent.");
            }

            var hasConflict = await HasBookingConflict(carId, startDate.Date, endDate.Date);

            return ServiceResult<CarAvailabilityModel>.Success(new CarAvailabilityModel
            {
                CarID = carId,
                StartDate = startDate.Date,
                EndDate = endDate.Date,
                IsAvailable = !hasConflict,
                Message = hasConflict
                    ? "Car is not available for the selected dates."
                    : "Car is available for the selected dates."
            });
        }

        public async Task<ServiceResult<List<RentalBookingListModel>>> GetByTenant(int tenantId, int accountId, string? role)
        {
            var query = _context.RentalBookings
                .Include(rb => rb.Car)
                .Where(rb => !rb.RentalBookingDeleted && rb.TenantID == tenantId)
                .AsQueryable();

            if (role != "Admin")
            {
                query = query.Where(rb => rb.Car != null && rb.Car.CreatedByAccountID == accountId);
            }

            var bookings = await query
                .OrderByDescending(rb => rb.RentalBookingCreationDate)
                .Select(ListProjection)
                .ToListAsync();

            return ServiceResult<List<RentalBookingListModel>>.Success(bookings);
        }

        public async Task<ServiceResult<RentalBookingStatusModel>> UpdateStatus(int id, string status, int accountId, string? role)
        {
            if (string.IsNullOrWhiteSpace(status) || !AllowedStatuses.Contains(status))
            {
                return ServiceResult<RentalBookingStatusModel>.BadRequest("Invalid booking status.");
            }

            var booking = await _context.RentalBookings
                .Include(rb => rb.Car)
                .FirstOrDefaultAsync(rb => rb.RentalBookingID == id && !rb.RentalBookingDeleted);

            if (booking == null)
            {
                return ServiceResult<RentalBookingStatusModel>.NotFound("Rental booking not found.");
            }

            if (role != "Admin" &&
                (booking.Car == null || booking.Car.CreatedByAccountID != accountId))
            {
                return ServiceResult<RentalBookingStatusModel>.Forbidden("You can update only bookings for cars created by you.");
            }

            booking.RentalBookingStatus = status;
            booking.RentalBookingUpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ServiceResult<RentalBookingStatusModel>.Success(new RentalBookingStatusModel
            {
                RentalBookingID = booking.RentalBookingID,
                Status = booking.RentalBookingStatus
            });
        }

        public async Task<ServiceResult<RentalBookingStatusModel>> Delete(int id, int accountId, string? role)
        {
            var booking = await _context.RentalBookings
                .Include(rb => rb.Car)
                .FirstOrDefaultAsync(rb => rb.RentalBookingID == id && !rb.RentalBookingDeleted);

            if (booking == null)
            {
                return ServiceResult<RentalBookingStatusModel>.NotFound("Rental booking not found.");
            }

            if (!CanAccessBooking(booking, accountId, role))
            {
                return ServiceResult<RentalBookingStatusModel>.Forbidden("You are not allowed to delete this booking.");
            }

            booking.RentalBookingDeleted = true;
            booking.RentalBookingDeletedDate = DateTime.UtcNow;
            booking.RentalBookingUpdatedDate = DateTime.UtcNow;
            booking.RentalBookingStatus = "Cancelled";

            await _context.SaveChangesAsync();

            return ServiceResult<RentalBookingStatusModel>.Success(new RentalBookingStatusModel
            {
                RentalBookingID = booking.RentalBookingID,
                Status = booking.RentalBookingStatus
            });
        }

        private async Task<bool> HasBookingConflict(int carId, DateTime startDate, DateTime endDate)
        {
            return await _context.RentalBookings
                .AnyAsync(rb =>
                    rb.CarID == carId &&
                    !rb.RentalBookingDeleted &&
                    rb.RentalBookingStatus != "Cancelled" &&
                    startDate < rb.RentalBookingEndDate &&
                    endDate > rb.RentalBookingStartDate);
        }

        private static string? ValidateDates(int carId, DateTime startDate, DateTime endDate)
        {
            if (carId <= 0)
            {
                return "Invalid car.";
            }

            if (startDate.Date < DateTime.UtcNow.Date)
            {
                return "Start date cannot be in the past.";
            }

            if (endDate.Date <= startDate.Date)
            {
                return "End date must be after start date.";
            }

            return null;
        }

        private static bool CanAccessBooking(RentalBooking booking, int accountId, string? role)
        {
            var isCustomer = booking.CustomerAccountID == accountId;
            var isCarOwner = booking.Car != null && booking.Car.CreatedByAccountID == accountId;
            var isAdmin = role == "Admin";

            return isCustomer || isCarOwner || isAdmin;
        }

        private static readonly Expression<Func<RentalBooking, RentalBookingListModel>> ListProjection = booking => new RentalBookingListModel
        {
            RentalBookingID = booking.RentalBookingID,
            TenantID = booking.TenantID,
            CarID = booking.CarID,
            CustomerAccountID = booking.CustomerAccountID,
            CarTitle = booking.Car != null ? booking.Car.CarTitle : string.Empty,
            CarBrand = booking.Car != null ? booking.Car.CarBrand : string.Empty,
            CarModel = booking.Car != null ? booking.Car.CarModel : string.Empty,
            RentalBookingStartDate = booking.RentalBookingStartDate,
            RentalBookingEndDate = booking.RentalBookingEndDate,
            RentalBookingDailyPrice = booking.RentalBookingDailyPrice,
            RentalBookingTotalPrice = booking.RentalBookingTotalPrice,
            RentalBookingStatus = booking.RentalBookingStatus,
            RentalBookingCreationDate = booking.RentalBookingCreationDate
        };
    }
}
