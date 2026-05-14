using AutoKosova.Api.DTOs.RentalBookings;
using AutoKosova.Business.Models;
using AutoKosova.Business.Services;
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

        [Authorize(Roles = "Admin,Seller")]
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

            var result = await _rentalBookingService.Create(new RentalBookingCreateCommand
            {
                CarID = request.CarID,
                RentalBookingStartDate = request.RentalBookingStartDate,
                RentalBookingEndDate = request.RentalBookingEndDate
            }, CurrentAccountId.Value);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(new
            {
                message = "Rental booking created successfully.",
                rentalBookingID = result.Data!.RentalBookingID,
                totalDays = result.Data.TotalDays,
                totalPrice = result.Data.TotalPrice
            });
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

        [Authorize(Roles = "Admin,Seller")]
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

        [Authorize(Roles = "Admin,Seller")]
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
                status = result.Data.Status
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

        private static RentalBookingListResponseDto ToListDto(RentalBookingListModel booking)
        {
            return new RentalBookingListResponseDto
            {
                RentalBookingID = booking.RentalBookingID,
                TenantID = booking.TenantID,
                CarID = booking.CarID,
                CustomerAccountID = booking.CustomerAccountID,
                CarTitle = booking.CarTitle,
                CarBrand = booking.CarBrand,
                CarModel = booking.CarModel,
                RentalBookingStartDate = booking.RentalBookingStartDate,
                RentalBookingEndDate = booking.RentalBookingEndDate,
                RentalBookingDailyPrice = booking.RentalBookingDailyPrice,
                RentalBookingTotalPrice = booking.RentalBookingTotalPrice,
                RentalBookingStatus = booking.RentalBookingStatus,
                RentalBookingCreationDate = booking.RentalBookingCreationDate
            };
        }

        private static RentalBookingDetailsResponseDto ToDetailsDto(RentalBookingDetailsModel booking)
        {
            return new RentalBookingDetailsResponseDto
            {
                RentalBookingID = booking.RentalBookingID,
                TenantID = booking.TenantID,
                CarID = booking.CarID,
                CustomerAccountID = booking.CustomerAccountID,
                CustomerUsername = booking.CustomerUsername,
                CustomerEmail = booking.CustomerEmail,
                CarTitle = booking.CarTitle,
                CarBrand = booking.CarBrand,
                CarModel = booking.CarModel,
                RentalBookingStartDate = booking.RentalBookingStartDate,
                RentalBookingEndDate = booking.RentalBookingEndDate,
                RentalBookingDailyPrice = booking.RentalBookingDailyPrice,
                RentalBookingTotalPrice = booking.RentalBookingTotalPrice,
                RentalBookingStatus = booking.RentalBookingStatus,
                RentalBookingCreationDate = booking.RentalBookingCreationDate,
                RentalBookingUpdatedDate = booking.RentalBookingUpdatedDate
            };
        }
    }
}
