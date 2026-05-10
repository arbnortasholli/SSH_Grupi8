using AutoKosova.Api.DTOs.CarImages;
using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    public class CarImagesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CarImagesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("api/cars/{carId:int}/images")]
        public async Task<IActionResult> GetImagesByCarId(int carId)
        {
            var carExists = await _context.Cars
                .AnyAsync(c => c.CarsID == carId && !c.CarDeleted);

            if (!carExists)
            {
                return NotFound("Car not found.");
            }

            var images = await _context.CarImages
                .Where(ci => ci.CarID == carId && !ci.CarImageDeleted)
                .OrderByDescending(ci => ci.CarImageIsMain)
                .ThenBy(ci => ci.CarImageOrderNumber)
                .Select(ci => new CarImageResponseDto
                {
                    CarImageID = ci.CarImageID,
                    CarID = ci.CarID,
                    CarImageUrl = ci.CarImageUrl,
                    CarImageIsMain = ci.CarImageIsMain,
                    CarImageOrderNumber = ci.CarImageOrderNumber,
                    CarImageCreationDate = ci.CarImageCreationDate
                })
                .ToListAsync();

            return Ok(images);
        }

        [HttpGet("api/car-images/{imageId:int}")]
        public async Task<IActionResult> GetImageById(int imageId)
        {
            var image = await _context.CarImages
                .Where(ci => ci.CarImageID == imageId && !ci.CarImageDeleted)
                .Select(ci => new CarImageResponseDto
                {
                    CarImageID = ci.CarImageID,
                    CarID = ci.CarID,
                    CarImageUrl = ci.CarImageUrl,
                    CarImageIsMain = ci.CarImageIsMain,
                    CarImageOrderNumber = ci.CarImageOrderNumber,
                    CarImageCreationDate = ci.CarImageCreationDate
                })
                .FirstOrDefaultAsync();

            if (image == null)
            {
                return NotFound("Car image not found.");
            }

            return Ok(image);
        }

        [Authorize(Roles = "Admin,Seller")]
        [HttpPost("api/cars/{carId:int}/images")]
        public async Task<IActionResult> AddImage(int carId, CarImageCreateRequestDto request)
        {
            var accountId = GetCurrentAccountId();
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (accountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            if (string.IsNullOrWhiteSpace(request.CarImageUrl))
            {
                return BadRequest("Car image URL is required.");
            }

            var car = await _context.Cars
                .FirstOrDefaultAsync(c => c.CarsID == carId && !c.CarDeleted);

            if (car == null)
            {
                return NotFound("Car not found.");
            }

            if (role != "Admin" && car.CreatedByAccountID != accountId.Value)
            {
                return Forbid("You can add images only to cars created by you.");
            }

            if (request.CarImageIsMain)
            {
                var existingMainImages = await _context.CarImages
                    .Where(ci => ci.CarID == carId && !ci.CarImageDeleted && ci.CarImageIsMain)
                    .ToListAsync();

                foreach (var existingImage in existingMainImages)
                {
                    existingImage.CarImageIsMain = false;
                }
            }

            var image = new CarImage
            {
                CarID = carId,
                CarImageUrl = request.CarImageUrl.Trim(),
                CarImageIsMain = request.CarImageIsMain,
                CarImageOrderNumber = request.CarImageOrderNumber,
                CarImageCreationDate = DateTime.UtcNow,
                CarImageDeleted = false
            };

            _context.CarImages.Add(image);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Car image added successfully.",
                carImageID = image.CarImageID
            });
        }

        [Authorize(Roles = "Admin,Seller")]
        [HttpPut("api/car-images/{imageId:int}/set-main")]
        public async Task<IActionResult> SetMainImage(int imageId)
        {
            var accountId = GetCurrentAccountId();
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (accountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var image = await _context.CarImages
                .Include(ci => ci.Car)
                .FirstOrDefaultAsync(ci => ci.CarImageID == imageId && !ci.CarImageDeleted);

            if (image == null)
            {
                return NotFound("Car image not found.");
            }

            if (image.Car == null || image.Car.CarDeleted)
            {
                return NotFound("Car not found.");
            }

            if (role != "Admin" && image.Car.CreatedByAccountID != accountId.Value)
            {
                return Forbid("You can update images only for cars created by you.");
            }

            var carImages = await _context.CarImages
                .Where(ci => ci.CarID == image.CarID && !ci.CarImageDeleted)
                .ToListAsync();

            foreach (var carImage in carImages)
            {
                carImage.CarImageIsMain = false;
            }

            image.CarImageIsMain = true;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Main image updated successfully.",
                carImageID = image.CarImageID
            });
        }

        [Authorize(Roles = "Admin,Seller")]
        [HttpDelete("api/car-images/{imageId:int}")]
        public async Task<IActionResult> DeleteImage(int imageId)
        {
            var accountId = GetCurrentAccountId();
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (accountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var image = await _context.CarImages
                .Include(ci => ci.Car)
                .FirstOrDefaultAsync(ci => ci.CarImageID == imageId && !ci.CarImageDeleted);

            if (image == null)
            {
                return NotFound("Car image not found.");
            }

            if (image.Car == null || image.Car.CarDeleted)
            {
                return NotFound("Car not found.");
            }

            if (role != "Admin" && image.Car.CreatedByAccountID != accountId.Value)
            {
                return Forbid("You can delete images only for cars created by you.");
            }

            image.CarImageDeleted = true;
            image.CarImageDeletedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Car image deleted successfully.",
                carImageID = image.CarImageID
            });
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