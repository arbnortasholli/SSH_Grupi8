using AutoKosova.Api.Authorization;
using AutoKosova.Business.DTOs.RentalBookings;
using AutoKosova.Business.Services;
using AutoKosova.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    public class RentalBookingsController : BaseApiController
    {
        private readonly RentalBookingService _rentalBookingService;

        public RentalBookingsController(RentalBookingService rentalBookingService)
        {
            _rentalBookingService = rentalBookingService;
        }

        [HasPermission("RentalBookings.View")]
        [HttpGet("api/rental-bookings")]
        public async Task<IActionResult> GetAll()
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _rentalBookingService.GetAll(CurrentAccountId.Value, CurrentRole);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result.Data!.Select(ToListDto));
        }

        [HasPermission("RentalBookings.View")]
        [HttpGet("api/rental-bookings/admin")]
        public async Task<IActionResult> GetAdminOverview()
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _rentalBookingService.GetAdminOverview(CurrentAccountId.Value, CurrentRole);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result.Data!.Select(ToAdminListDto));
        }

        [Authorize]
        [HttpGet("api/rental-bookings/{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _rentalBookingService.GetById(id, CurrentAccountId.Value, CurrentRole);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(ToDetailsDto(result.Data!));
        }

        [Authorize]
        [HttpPost("api/rental-bookings")]
        public async Task<IActionResult> Create(RentalBookingCreateRequestDto request)
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _rentalBookingService.CreateWithPayment(
                request.CarID,
                request.RentalBookingStartDate,
                request.RentalBookingEndDate,
                CurrentAccountId.Value);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result.Data);
        }

        [Authorize]
        [HttpGet("api/accounts/me/bookings")]
        public async Task<IActionResult> GetMyBookings()
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _rentalBookingService.GetMyBookings(CurrentAccountId.Value);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result.Data!.Select(ToListDto));
        }

        [HttpGet("api/cars/{carId:int}/availability")]
        public async Task<IActionResult> CheckAvailability(
            int carId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var result = await _rentalBookingService.CheckAvailability(carId, startDate, endDate);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(new CarAvailabilityResponseDto
            {
                CarID = result.Data!.CarID,
                StartDate = result.Data.StartDate,
                EndDate = result.Data.EndDate,
                IsAvailable = result.Data.IsAvailable,
                Message = result.Data.Message
            });
        }

        [HasPermission("RentalBookings.ViewByTenant")]
        [HttpGet("api/tenants/{tenantId:int}/bookings")]
        public async Task<IActionResult> GetByTenant(int tenantId)
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _rentalBookingService.GetByTenant(tenantId, CurrentAccountId.Value, CurrentRole);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result.Data!.Select(ToListDto));
        }

        [HasPermission("RentalBookings.UpdateStatus")]
        [HttpPut("api/rental-bookings/{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(int id, RentalBookingStatusUpdateDto request)
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _rentalBookingService.UpdateStatus(id, request.Status, CurrentAccountId.Value, CurrentRole);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(new
            {
                message = "Rental booking status updated successfully.",
                rentalBookingID = result.Data!.RentalBookingID,
                status = result.Data.RentalBookingStatus
            });
        }

        [Authorize]
        [HttpDelete("api/rental-bookings/{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _rentalBookingService.Delete(id, CurrentAccountId.Value, CurrentRole);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(new
            {
                message = "Rental booking cancelled successfully.",
                rentalBookingID = result.Data!.RentalBookingID
            });
        }

        private static RentalBookingListResponseDto ToListDto(RentalBooking booking)
        {
            return new RentalBookingListResponseDto
            {
                RentalBookingID = booking.RentalBookingID,
                TenantID = booking.TenantID,
                CarID = booking.CarID,
                CustomerAccountID = booking.CustomerAccountID,
                CarTitle = booking.Car?.CarTitle ?? string.Empty,
                CarBrand = booking.Car?.CarBrand ?? string.Empty,
                CarModel = booking.Car?.CarModel ?? string.Empty,
                RentalBookingStartDate = booking.RentalBookingStartDate,
                RentalBookingEndDate = booking.RentalBookingEndDate,
                RentalBookingDailyPrice = booking.RentalBookingDailyPrice,
                RentalBookingTotalPrice = booking.RentalBookingTotalPrice,
                RentalBookingStatus = booking.RentalBookingStatus,
                RentalBookingCreationDate = booking.RentalBookingCreationDate
            };
        }

        private static RentalBookingDetailsResponseDto ToDetailsDto(RentalBooking booking)
        {
            return new RentalBookingDetailsResponseDto
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
        }

        private static RentalBookingAdminListResponseDto ToAdminListDto(RentalBooking booking)
        {
            var latestPayment = booking.PaymentOrders
                .OrderByDescending(payment => payment.CreatedDate)
                .FirstOrDefault();

            return new RentalBookingAdminListResponseDto
            {
                RentalBookingID = booking.RentalBookingID,
                TenantID = booking.TenantID,
                TenantName = booking.Tenant?.TenantName ?? string.Empty,
                CarID = booking.CarID,
                CarTitle = booking.Car?.CarTitle ?? string.Empty,
                CarBrand = booking.Car?.CarBrand ?? string.Empty,
                CarModel = booking.Car?.CarModel ?? string.Empty,
                CarYear = booking.Car?.CarYear ?? 0,
                CustomerAccountID = booking.CustomerAccountID,
                CustomerName = string.Join(" ", new[]
                {
                    booking.CustomerAccount?.AccountName,
                    booking.CustomerAccount?.AccountLastname
                }.Where(value => !string.IsNullOrWhiteSpace(value))),
                CustomerEmail = booking.CustomerAccount?.AccountEmail ?? string.Empty,
                CustomerPhoneNumber = booking.CustomerAccount?.AccountPhoneNumber ?? string.Empty,
                CustomerCity = booking.CustomerAccount?.AccountCity ?? string.Empty,
                RentalBookingStartDate = booking.RentalBookingStartDate,
                RentalBookingEndDate = booking.RentalBookingEndDate,
                RentalBookingDailyPrice = booking.RentalBookingDailyPrice,
                RentalBookingTotalPrice = booking.RentalBookingTotalPrice,
                RentalBookingStatus = booking.RentalBookingStatus,
                RentalBookingCreationDate = booking.RentalBookingCreationDate,
                PaymentStatus = latestPayment?.PaymentStatus?.PaymentStatusName ?? string.Empty,
                PaymentAmount = latestPayment?.Amount,
                PaymentPaidDate = latestPayment?.PaidDate
            };
        }
    }
}
