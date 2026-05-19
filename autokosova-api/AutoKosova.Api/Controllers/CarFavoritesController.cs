using AutoKosova.Business.DTOs.CarFavorites;
using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    public class CarFavoritesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CarFavoritesController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpPost("api/cars/{carId:int}/favorite")]
        public async Task<IActionResult> AddToFavorite(int carId)
        {
            var accountId = GetCurrentAccountId();

            if (accountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var carExists = await _context.Cars
                .AnyAsync(c => c.CarsID == carId && !c.CarDeleted);

            if (!carExists)
            {
                return NotFound("Car not found.");
            }

            var existingFavorite = await _context.CarFavorites
                .FirstOrDefaultAsync(cf =>
                    cf.AccountID == accountId.Value &&
                    cf.CarID == carId);

            if (existingFavorite != null)
            {
                if (!existingFavorite.CarFavoriteDeleted)
                {
                    return BadRequest("Car is already in favorites.");
                }

                existingFavorite.CarFavoriteDeleted = false;
                existingFavorite.CarFavoriteDeletedDate = null;
                existingFavorite.CarFavoriteCreationDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Car added to favorites successfully.",
                    carFavoriteID = existingFavorite.CarFavoriteID
                });
            }

            var favorite = new CarFavorite
            {
                AccountID = accountId.Value,
                CarID = carId,
                CarFavoriteCreationDate = DateTime.UtcNow,
                CarFavoriteDeleted = false
            };

            _context.CarFavorites.Add(favorite);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Car added to favorites successfully.",
                carFavoriteID = favorite.CarFavoriteID
            });
        }

        [Authorize]
        [HttpDelete("api/cars/{carId:int}/favorite")]
        public async Task<IActionResult> RemoveFromFavorite(int carId)
        {
            var accountId = GetCurrentAccountId();

            if (accountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var favorite = await _context.CarFavorites
                .FirstOrDefaultAsync(cf =>
                    cf.AccountID == accountId.Value &&
                    cf.CarID == carId &&
                    !cf.CarFavoriteDeleted);

            if (favorite == null)
            {
                return NotFound("Favorite not found.");
            }

            favorite.CarFavoriteDeleted = true;
            favorite.CarFavoriteDeletedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Car removed from favorites successfully.",
                carID = carId
            });
        }

        [Authorize]
        [HttpGet("api/accounts/me/favorites")]
        public async Task<IActionResult> GetMyFavorites()
        {
            var accountId = GetCurrentAccountId();

            if (accountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var favorites = await _context.CarFavorites
                .Include(cf => cf.Car)
                .Where(cf =>
                    cf.AccountID == accountId.Value &&
                    !cf.CarFavoriteDeleted &&
                    cf.Car != null &&
                    !cf.Car.CarDeleted)
                .OrderByDescending(cf => cf.CarFavoriteCreationDate)
                .Select(cf => new CarFavoriteResponseDto
                {
                    CarFavoriteID = cf.CarFavoriteID,
                    CarID = cf.CarID,
                    CarTitle = cf.Car != null ? cf.Car.CarTitle : string.Empty,
                    CarBrand = cf.Car != null ? cf.Car.CarBrand : string.Empty,
                    CarModel = cf.Car != null ? cf.Car.CarModel : string.Empty,
                    CarYear = cf.Car != null ? cf.Car.CarYear : 0,
                    CarMileage = cf.Car != null ? cf.Car.CarMileage : 0,
                    IsForSale = cf.Car != null && cf.Car.IsForSale,
                    SalePrice = cf.Car != null ? cf.Car.SalePrice : null,
                    IsForRent = cf.Car != null && cf.Car.IsForRent,
                    RentalDailyPrice = cf.Car != null ? cf.Car.RentalDailyPrice : null,
                    CarStatus = cf.Car != null ? cf.Car.CarStatus : string.Empty,
                    CarFavoriteCreationDate = cf.CarFavoriteCreationDate
                })
                .ToListAsync();

            return Ok(favorites);
        }

        [Authorize]
        [HttpGet("api/cars/{carId:int}/favorite-status")]
        public async Task<IActionResult> GetFavoriteStatus(int carId)
        {
            var accountId = GetCurrentAccountId();

            if (accountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var carExists = await _context.Cars
                .AnyAsync(c => c.CarsID == carId && !c.CarDeleted);

            if (!carExists)
            {
                return NotFound("Car not found.");
            }

            var isFavorite = await _context.CarFavorites
                .AnyAsync(cf =>
                    cf.AccountID == accountId.Value &&
                    cf.CarID == carId &&
                    !cf.CarFavoriteDeleted);

            var response = new CarFavoriteStatusResponseDto
            {
                CarID = carId,
                IsFavorite = isFavorite
            };

            return Ok(response);
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