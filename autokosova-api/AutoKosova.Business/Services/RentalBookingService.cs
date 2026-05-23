using AutoKosova.DataAccess;
using AutoKosova.Business.DTOs.RentalBookings;
using AutoKosova.Entity;
using Microsoft.EntityFrameworkCore;

namespace AutoKosova.Business.Services
{
    public class RentalBookingService
    {
        private static readonly string[] AllowedStatuses =
        {
            PaymentConstants.RentalStatusPendingPayment,
            PaymentConstants.RentalStatusConfirmed,
            PaymentConstants.RentalStatusCancelled,
            PaymentConstants.RentalStatusCompleted
        };

        private readonly AppDbContext _context;
        private readonly PaymentService _paymentService;

        public RentalBookingService(AppDbContext context, PaymentService paymentService)
        {
            _context = context;
            _paymentService = paymentService;
        }

        public async Task<ServiceResult<List<RentalBooking>>> GetAll(int accountId, string? role)
        {
            var query = _context.RentalBookings
                .Include(rb => rb.Car)
                .Where(rb => !rb.RentalBookingDeleted)
                .AsQueryable();

            if (role != "SuperAdmin")
            {
                query = query.Where(rb => rb.Car != null && rb.Car.CreatedByAccountID == accountId);
            }

            var bookings = await query
                .OrderByDescending(rb => rb.RentalBookingCreationDate)
                .ToListAsync();

            return ServiceResult<List<RentalBooking>>.Success(bookings);
        }

        public async Task<ServiceResult<RentalBooking>> GetById(int id, int accountId, string? role)
        {
            var booking = await _context.RentalBookings
                .Include(rb => rb.Car)
                .Include(rb => rb.CustomerAccount)
                .FirstOrDefaultAsync(rb => rb.RentalBookingID == id && !rb.RentalBookingDeleted);

            if (booking == null)
            {
                return ServiceResult<RentalBooking>.NotFound("Rental booking not found.");
            }

            if (!CanAccessBooking(booking, accountId, role))
            {
                return ServiceResult<RentalBooking>.Forbidden("You are not allowed to view this booking.");
            }

            return ServiceResult<RentalBooking>.Success(booking);
        }

        public async Task<ServiceResult<(RentalBooking Booking, int TotalDays, decimal TotalPrice)>> Create(
            int carId,
            DateTime rentalBookingStartDate,
            DateTime rentalBookingEndDate,
            int accountId)
        {
            var validationError = ValidateDates(carId, rentalBookingStartDate, rentalBookingEndDate);

            if (validationError != null)
            {
                return ServiceResult<(RentalBooking Booking, int TotalDays, decimal TotalPrice)>.BadRequest(validationError);
            }

            var car = await _context.Cars
                .Include(c => c.Tenant)
                .FirstOrDefaultAsync(c =>
                    c.CarsID == carId &&
                    !c.CarDeleted &&
                    c.IsForRent);

            if (car == null)
            {
                return ServiceResult<(RentalBooking Booking, int TotalDays, decimal TotalPrice)>.NotFound("Car not found or not available for rent.");
            }

            if (!car.TenantID.HasValue)
            {
                return ServiceResult<(RentalBooking Booking, int TotalDays, decimal TotalPrice)>.BadRequest("Rental car must belong to a tenant.");
            }

            if (!car.RentalDailyPrice.HasValue || car.RentalDailyPrice.Value <= 0)
            {
                return ServiceResult<(RentalBooking Booking, int TotalDays, decimal TotalPrice)>.BadRequest("Car rental daily price is not valid.");
            }

            var startDate = rentalBookingStartDate.Date;
            var endDate = rentalBookingEndDate.Date;
            var hasConflict = await HasBookingConflict(carId, startDate, endDate);

            if (hasConflict)
            {
                return ServiceResult<(RentalBooking Booking, int TotalDays, decimal TotalPrice)>.BadRequest("Car is not available for the selected dates.");
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
                RentalBookingStatus = PaymentConstants.RentalStatusPendingPayment,
                RentalBookingCreationDate = DateTime.UtcNow,
                RentalBookingDeleted = false,
                Tenant = car.Tenant,
                Car = car
            };

            _context.RentalBookings.Add(booking);
            await _context.SaveChangesAsync();

            return ServiceResult<(RentalBooking Booking, int TotalDays, decimal TotalPrice)>.Success((booking, totalDays, totalPrice));
        }

        public async Task<ServiceResult<RentalBookingCreateResponseDto>> CreateWithPayment(
            int carId,
            DateTime rentalBookingStartDate,
            DateTime rentalBookingEndDate,
            int accountId)
        {
            var bookingResult = await Create(carId, rentalBookingStartDate, rentalBookingEndDate, accountId);

            if (!bookingResult.IsSuccess)
            {
                return bookingResult.Status switch
                {
                    ServiceStatus.NotFound => ServiceResult<RentalBookingCreateResponseDto>.NotFound(bookingResult.Error!),
                    ServiceStatus.Forbidden => ServiceResult<RentalBookingCreateResponseDto>.Forbidden(bookingResult.Error!),
                    _ => ServiceResult<RentalBookingCreateResponseDto>.BadRequest(bookingResult.Error ?? "Rental booking could not be created.")
                };
            }

            var checkoutResult = await _paymentService.CreateCheckoutSession(bookingResult.Data!.Booking.RentalBookingID, accountId);

            if (!checkoutResult.IsSuccess)
            {
                return checkoutResult.Status switch
                {
                    ServiceStatus.NotFound => ServiceResult<RentalBookingCreateResponseDto>.NotFound(checkoutResult.Error!),
                    ServiceStatus.Forbidden => ServiceResult<RentalBookingCreateResponseDto>.Forbidden(checkoutResult.Error!),
                    _ => ServiceResult<RentalBookingCreateResponseDto>.BadRequest(checkoutResult.Error ?? "Checkout session could not be created.")
                };
            }

            return ServiceResult<RentalBookingCreateResponseDto>.Success(new RentalBookingCreateResponseDto
            {
                Message = "Rental booking created. Continue to payment.",
                RentalBookingID = bookingResult.Data.Booking.RentalBookingID,
                PaymentOrderID = checkoutResult.Data!.PaymentOrderID,
                TotalDays = bookingResult.Data.TotalDays,
                TotalPrice = bookingResult.Data.TotalPrice,
                RentalBookingStatus = bookingResult.Data.Booking.RentalBookingStatus,
                PaymentStatus = "Pending",
                CheckoutUrl = checkoutResult.Data.CheckoutUrl
            });
        }

        public async Task<ServiceResult<List<RentalBooking>>> GetMyBookings(int accountId)
        {
            var bookings = await _context.RentalBookings
                .Include(rb => rb.Car)
                .Where(rb => !rb.RentalBookingDeleted && rb.CustomerAccountID == accountId)
                .OrderByDescending(rb => rb.RentalBookingCreationDate)
                .ToListAsync();

            return ServiceResult<List<RentalBooking>>.Success(bookings);
        }

        public async Task<ServiceResult<(int CarID, DateTime StartDate, DateTime EndDate, bool IsAvailable, string Message)>> CheckAvailability(int carId, DateTime startDate, DateTime endDate)
        {
            var validationError = ValidateDates(carId, startDate, endDate);

            if (validationError != null)
            {
                return ServiceResult<(int CarID, DateTime StartDate, DateTime EndDate, bool IsAvailable, string Message)>.BadRequest(validationError);
            }

            var carExists = await _context.Cars
                .AnyAsync(c => c.CarsID == carId && !c.CarDeleted && c.IsForRent);

            if (!carExists)
            {
                return ServiceResult<(int CarID, DateTime StartDate, DateTime EndDate, bool IsAvailable, string Message)>.NotFound("Car not found or not available for rent.");
            }

            var hasConflict = await HasBookingConflict(carId, startDate.Date, endDate.Date);

            return ServiceResult<(int CarID, DateTime StartDate, DateTime EndDate, bool IsAvailable, string Message)>.Success((
                carId,
                startDate.Date,
                endDate.Date,
                !hasConflict,
                hasConflict
                    ? "Car is not available for the selected dates."
                    : "Car is available for the selected dates."
            ));
        }

        public async Task<ServiceResult<List<RentalBooking>>> GetByTenant(int tenantId, int accountId, string? role)
        {
            var query = _context.RentalBookings
                .Include(rb => rb.Car)
                .Where(rb => !rb.RentalBookingDeleted && rb.TenantID == tenantId)
                .AsQueryable();

            if (role != "SuperAdmin")
            {
                query = query.Where(rb => rb.Car != null && rb.Car.CreatedByAccountID == accountId);
            }

            var bookings = await query
                .OrderByDescending(rb => rb.RentalBookingCreationDate)
                .ToListAsync();

            return ServiceResult<List<RentalBooking>>.Success(bookings);
        }

        public async Task<ServiceResult<RentalBooking>> UpdateStatus(int id, string status, int accountId, string? role)
        {
            if (string.IsNullOrWhiteSpace(status) || !AllowedStatuses.Contains(status))
            {
                return ServiceResult<RentalBooking>.BadRequest("Invalid booking status.");
            }

            var booking = await _context.RentalBookings
                .Include(rb => rb.Car)
                .FirstOrDefaultAsync(rb => rb.RentalBookingID == id && !rb.RentalBookingDeleted);

            if (booking == null)
            {
                return ServiceResult<RentalBooking>.NotFound("Rental booking not found.");
            }

            if (role != "SuperAdmin" &&
                (booking.Car == null || booking.Car.CreatedByAccountID != accountId))
            {
                return ServiceResult<RentalBooking>.Forbidden("You can update only bookings for cars created by you.");
            }

            booking.RentalBookingStatus = status;
            booking.RentalBookingUpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ServiceResult<RentalBooking>.Success(booking);
        }

        public async Task<ServiceResult<RentalBooking>> Delete(int id, int accountId, string? role)
        {
            var booking = await _context.RentalBookings
                .Include(rb => rb.Car)
                .FirstOrDefaultAsync(rb => rb.RentalBookingID == id && !rb.RentalBookingDeleted);

            if (booking == null)
            {
                return ServiceResult<RentalBooking>.NotFound("Rental booking not found.");
            }

            if (!CanAccessBooking(booking, accountId, role))
            {
                return ServiceResult<RentalBooking>.Forbidden("You are not allowed to delete this booking.");
            }

            booking.RentalBookingDeleted = true;
            booking.RentalBookingDeletedDate = DateTime.UtcNow;
            booking.RentalBookingUpdatedDate = DateTime.UtcNow;
            booking.RentalBookingStatus = PaymentConstants.RentalStatusCancelled;

            await _context.SaveChangesAsync();

            return ServiceResult<RentalBooking>.Success(booking);
        }

        private async Task<bool> HasBookingConflict(int carId, DateTime startDate, DateTime endDate)
        {
            return await _context.RentalBookings
                .AnyAsync(rb =>
                    rb.CarID == carId &&
                    !rb.RentalBookingDeleted &&
                    rb.RentalBookingStatus != PaymentConstants.RentalStatusCancelled &&
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
            var isAdmin = role == "SuperAdmin";

            return isCustomer || isCarOwner || isAdmin;
        }
    }
}
