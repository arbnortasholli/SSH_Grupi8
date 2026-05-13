using AutoKosova.Api.DTOs.RentalBookings;
using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    public class RentalBookingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RentalBookingsController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "Admin,Seller")]
        [HttpGet("api/rental-bookings")]
        public async Task<IActionResult> GetAll()
        {
            var accountId = GetCurrentAccountId();
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (accountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var query = _context.RentalBookings
                .Include(rb => rb.Car)
                .Where(rb => !rb.RentalBookingDeleted)
                .AsQueryable();

            if (role != "Admin")
            {
                query = query.Where(rb => rb.Car != null && rb.Car.CreatedByAccountID == accountId.Value);
            }

            var bookings = await query
                .OrderByDescending(rb => rb.RentalBookingCreationDate)
                .Select(rb => new RentalBookingListResponseDto
                {
                    RentalBookingID = rb.RentalBookingID,
                    TenantID = rb.TenantID,
                    CarID = rb.CarID,
                    CustomerAccountID = rb.CustomerAccountID,
                    CarTitle = rb.Car != null ? rb.Car.CarTitle : string.Empty,
                    CarBrand = rb.Car != null ? rb.Car.CarBrand : string.Empty,
                    CarModel = rb.Car != null ? rb.Car.CarModel : string.Empty,
                    RentalBookingStartDate = rb.RentalBookingStartDate,
                    RentalBookingEndDate = rb.RentalBookingEndDate,
                    RentalBookingDailyPrice = rb.RentalBookingDailyPrice,
                    RentalBookingTotalPrice = rb.RentalBookingTotalPrice,
                    RentalBookingStatus = rb.RentalBookingStatus,
                    RentalBookingCreationDate = rb.RentalBookingCreationDate
                })
                .ToListAsync();

            return Ok(bookings);
        }

        [Authorize]
        [HttpGet("api/rental-bookings/{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var accountId = GetCurrentAccountId();
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (accountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var booking = await _context.RentalBookings
                .Include(rb => rb.Car)
                .Include(rb => rb.CustomerAccount)
                .FirstOrDefaultAsync(rb => rb.RentalBookingID == id && !rb.RentalBookingDeleted);

            if (booking == null)
            {
                return NotFound("Rental booking not found.");
            }

            var isCustomer = booking.CustomerAccountID == accountId.Value;
            var isCarOwner = booking.Car != null && booking.Car.CreatedByAccountID == accountId.Value;
            var isAdmin = role == "Admin";

            if (!isCustomer && !isCarOwner && !isAdmin)
            {
                return Forbid("You are not allowed to view this booking.");
            }

            var response = new RentalBookingDetailsResponseDto
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
            };

            return Ok(response);
        }

        [Authorize]
        [HttpPost("api/rental-bookings")]
        public async Task<IActionResult> Create(RentalBookingCreateRequestDto request)
        {
            var accountId = GetCurrentAccountId();

            if (accountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            if (request.CarID <= 0)
            {
                return BadRequest("Invalid car.");
            }

            if (request.RentalBookingStartDate.Date < DateTime.UtcNow.Date)
            {
                return BadRequest("Start date cannot be in the past.");
            }

            if (request.RentalBookingEndDate.Date <= request.RentalBookingStartDate.Date)
            {
                return BadRequest("End date must be after start date.");
            }

            var car = await _context.Cars
    .Include(c => c.Tenant)
    .FirstOrDefaultAsync(c =>
        c.CarsID == request.CarID &&
        !c.CarDeleted &&
        c.IsForRent);

            if (car == null)
            {
                return NotFound("Car not found or not available for rent.");
            }

            if (!car.TenantID.HasValue)
            {
                return BadRequest("Rental car must belong to a tenant.");
            }

            if (!car.RentalDailyPrice.HasValue || car.RentalDailyPrice.Value <= 0)
            {
                return BadRequest("Car rental daily price is not valid.");
            }

            var hasConflict = await HasBookingConflict(
                request.CarID,
                request.RentalBookingStartDate.Date,
                request.RentalBookingEndDate.Date
            );

            if (hasConflict)
            {
                return BadRequest("Car is not available for the selected dates.");
            }

            var totalDays = (request.RentalBookingEndDate.Date - request.RentalBookingStartDate.Date).Days;
            var totalPrice = totalDays * car.RentalDailyPrice.Value;

            var booking = new RentalBooking
            {
                TenantID = car.TenantID.Value,
                CarID = car.CarsID,
                CustomerAccountID = accountId.Value,
                RentalBookingStartDate = request.RentalBookingStartDate.Date,
                RentalBookingEndDate = request.RentalBookingEndDate.Date,
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

            return Ok(new
            {
                message = "Rental booking created successfully.",
                rentalBookingID = booking.RentalBookingID,
                totalDays,
                totalPrice
            });
        }

        [Authorize]
        [HttpGet("api/accounts/me/bookings")]
        public async Task<IActionResult> GetMyBookings()
        {
            var accountId = GetCurrentAccountId();

            if (accountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var bookings = await _context.RentalBookings
                .Include(rb => rb.Car)
                .Where(rb => !rb.RentalBookingDeleted && rb.CustomerAccountID == accountId.Value)
                .OrderByDescending(rb => rb.RentalBookingCreationDate)
                .Select(rb => new RentalBookingListResponseDto
                {
                    RentalBookingID = rb.RentalBookingID,
                    TenantID = rb.TenantID,
                    CarID = rb.CarID,
                    CustomerAccountID = rb.CustomerAccountID,
                    CarTitle = rb.Car != null ? rb.Car.CarTitle : string.Empty,
                    CarBrand = rb.Car != null ? rb.Car.CarBrand : string.Empty,
                    CarModel = rb.Car != null ? rb.Car.CarModel : string.Empty,
                    RentalBookingStartDate = rb.RentalBookingStartDate,
                    RentalBookingEndDate = rb.RentalBookingEndDate,
                    RentalBookingDailyPrice = rb.RentalBookingDailyPrice,
                    RentalBookingTotalPrice = rb.RentalBookingTotalPrice,
                    RentalBookingStatus = rb.RentalBookingStatus,
                    RentalBookingCreationDate = rb.RentalBookingCreationDate
                })
                .ToListAsync();

            return Ok(bookings);
        }

        [HttpGet("api/cars/{carId:int}/availability")]
        public async Task<IActionResult> CheckAvailability(
            int carId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            if (startDate.Date < DateTime.UtcNow.Date)
            {
                return BadRequest("Start date cannot be in the past.");
            }

            if (endDate.Date <= startDate.Date)
            {
                return BadRequest("End date must be after start date.");
            }

            var carExists = await _context.Cars
                .AnyAsync(c => c.CarsID == carId && !c.CarDeleted && c.IsForRent);

            if (!carExists)
            {
                return NotFound("Car not found or not available for rent.");
            }

            var hasConflict = await HasBookingConflict(carId, startDate.Date, endDate.Date);

            var response = new CarAvailabilityResponseDto
            {
                CarID = carId,
                StartDate = startDate.Date,
                EndDate = endDate.Date,
                IsAvailable = !hasConflict,
                Message = hasConflict
                    ? "Car is not available for the selected dates."
                    : "Car is available for the selected dates."
            };

            return Ok(response);
        }

        [Authorize(Roles = "Admin,Seller")]
        [HttpGet("api/tenants/{tenantId:int}/bookings")]
        public async Task<IActionResult> GetByTenant(int tenantId)
        {
            var accountId = GetCurrentAccountId();
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (accountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var query = _context.RentalBookings
                .Include(rb => rb.Car)
                .Where(rb => !rb.RentalBookingDeleted && rb.TenantID == tenantId)
                .AsQueryable();

            if (role != "Admin")
            {
                query = query.Where(rb => rb.Car != null && rb.Car.CreatedByAccountID == accountId.Value);
            }

            var bookings = await query
                .OrderByDescending(rb => rb.RentalBookingCreationDate)
                .Select(rb => new RentalBookingListResponseDto
                {
                    RentalBookingID = rb.RentalBookingID,
                    TenantID = rb.TenantID,
                    CarID = rb.CarID,
                    CustomerAccountID = rb.CustomerAccountID,
                    CarTitle = rb.Car != null ? rb.Car.CarTitle : string.Empty,
                    CarBrand = rb.Car != null ? rb.Car.CarBrand : string.Empty,
                    CarModel = rb.Car != null ? rb.Car.CarModel : string.Empty,
                    RentalBookingStartDate = rb.RentalBookingStartDate,
                    RentalBookingEndDate = rb.RentalBookingEndDate,
                    RentalBookingDailyPrice = rb.RentalBookingDailyPrice,
                    RentalBookingTotalPrice = rb.RentalBookingTotalPrice,
                    RentalBookingStatus = rb.RentalBookingStatus,
                    RentalBookingCreationDate = rb.RentalBookingCreationDate
                })
                .ToListAsync();

            return Ok(bookings);
        }

        [Authorize(Roles = "Admin,Seller")]
        [HttpPut("api/rental-bookings/{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(int id, RentalBookingStatusUpdateDto request)
        {
            var accountId = GetCurrentAccountId();
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (accountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var allowedStatuses = new[] { "Pending", "Confirmed", "Cancelled", "Completed" };

            if (string.IsNullOrWhiteSpace(request.Status) ||
                !allowedStatuses.Contains(request.Status))
            {
                return BadRequest("Invalid booking status.");
            }

            var booking = await _context.RentalBookings
                .Include(rb => rb.Car)
                .FirstOrDefaultAsync(rb => rb.RentalBookingID == id && !rb.RentalBookingDeleted);

            if (booking == null)
            {
                return NotFound("Rental booking not found.");
            }

            if (role != "Admin" &&
                (booking.Car == null || booking.Car.CreatedByAccountID != accountId.Value))
            {
                return Forbid("You can update only bookings for cars created by you.");
            }

            booking.RentalBookingStatus = request.Status;
            booking.RentalBookingUpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Rental booking status updated successfully.",
                rentalBookingID = booking.RentalBookingID,
                status = booking.RentalBookingStatus
            });
        }

        [Authorize]
        [HttpDelete("api/rental-bookings/{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var accountId = GetCurrentAccountId();
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (accountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var booking = await _context.RentalBookings
                .Include(rb => rb.Car)
                .FirstOrDefaultAsync(rb => rb.RentalBookingID == id && !rb.RentalBookingDeleted);

            if (booking == null)
            {
                return NotFound("Rental booking not found.");
            }

            var isCustomer = booking.CustomerAccountID == accountId.Value;
            var isCarOwner = booking.Car != null && booking.Car.CreatedByAccountID == accountId.Value;
            var isAdmin = role == "Admin";

            if (!isCustomer && !isCarOwner && !isAdmin)
            {
                return Forbid("You are not allowed to delete this booking.");
            }

            booking.RentalBookingDeleted = true;
            booking.RentalBookingDeletedDate = DateTime.UtcNow;
            booking.RentalBookingUpdatedDate = DateTime.UtcNow;
            booking.RentalBookingStatus = "Cancelled";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Rental booking cancelled successfully.",
                rentalBookingID = booking.RentalBookingID
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

        private int? GetCurrentAccountId()
        {
            var accountIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (int.TryParse(accountIdValue, out var accountId))
            {
                return accountId;
            }

            return null;
        }
    }
}