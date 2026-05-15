using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.EntityFrameworkCore;

namespace AutoKosova.Business.Services
{
    public class CarImageService
    {
        private readonly AppDbContext _context;

        public CarImageService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<List<CarImage>>> GetImagesByCarId(int carId)
        {
            var carExists = await _context.Cars
                .AnyAsync(c => c.CarsID == carId && !c.CarDeleted);

            if (!carExists)
            {
                return ServiceResult<List<CarImage>>.NotFound("Car not found.");
            }

            var images = await _context.CarImages
                .Where(ci => ci.CarID == carId && !ci.CarImageDeleted)
                .OrderByDescending(ci => ci.CarImageIsMain)
                .ThenBy(ci => ci.CarImageOrderNumber)
                .ToListAsync();

            return ServiceResult<List<CarImage>>.Success(images);
        }

        public async Task<ServiceResult<CarImage>> GetImageById(int imageId)
        {
            var image = await _context.CarImages
                .Where(ci => ci.CarImageID == imageId && !ci.CarImageDeleted)
                .FirstOrDefaultAsync();

            if (image == null)
            {
                return ServiceResult<CarImage>.NotFound("Car image not found.");
            }

            return ServiceResult<CarImage>.Success(image);
        }

        public async Task<ServiceResult<CarImage>> AddImage(
            int carId,
            string carImageUrl,
            bool carImageIsMain,
            int carImageOrderNumber,
            int accountId,
            string? role)
        {
            if (string.IsNullOrWhiteSpace(carImageUrl))
            {
                return ServiceResult<CarImage>.BadRequest("Car image URL is required.");
            }

            var car = await _context.Cars
                .FirstOrDefaultAsync(c => c.CarsID == carId && !c.CarDeleted);

            if (car == null)
            {
                return ServiceResult<CarImage>.NotFound("Car not found.");
            }

            if (role != "Admin" && car.CreatedByAccountID != accountId)
            {
                return ServiceResult<CarImage>.Forbidden("You can add images only to cars created by you.");
            }

            if (carImageIsMain)
            {
                await ClearMainImages(carId);
            }

            var image = new CarImage
            {
                CarID = carId,
                Car = car,
                CarImageUrl = carImageUrl.Trim(),
                CarImageIsMain = carImageIsMain,
                CarImageOrderNumber = carImageOrderNumber,
                CarImageCreationDate = DateTime.UtcNow,
                CarImageDeleted = false
            };

            _context.CarImages.Add(image);
            await _context.SaveChangesAsync();

            return ServiceResult<CarImage>.Success(image);
        }

        public async Task<ServiceResult<CarImage>> SetMainImage(int imageId, int accountId, string? role)
        {
            var image = await _context.CarImages
                .Include(ci => ci.Car)
                .FirstOrDefaultAsync(ci => ci.CarImageID == imageId && !ci.CarImageDeleted);

            if (image == null)
            {
                return ServiceResult<CarImage>.NotFound("Car image not found.");
            }

            if (image.Car == null || image.Car.CarDeleted)
            {
                return ServiceResult<CarImage>.NotFound("Car not found.");
            }

            if (role != "Admin" && image.Car.CreatedByAccountID != accountId)
            {
                return ServiceResult<CarImage>.Forbidden("You can update images only for cars created by you.");
            }

            await ClearMainImages(image.CarID);
            image.CarImageIsMain = true;

            await _context.SaveChangesAsync();

            return ServiceResult<CarImage>.Success(image);
        }

        public async Task<ServiceResult<CarImage>> DeleteImage(int imageId, int accountId, string? role)
        {
            var image = await _context.CarImages
                .Include(ci => ci.Car)
                .FirstOrDefaultAsync(ci => ci.CarImageID == imageId && !ci.CarImageDeleted);

            if (image == null)
            {
                return ServiceResult<CarImage>.NotFound("Car image not found.");
            }

            if (image.Car == null || image.Car.CarDeleted)
            {
                return ServiceResult<CarImage>.NotFound("Car not found.");
            }

            if (role != "Admin" && image.Car.CreatedByAccountID != accountId)
            {
                return ServiceResult<CarImage>.Forbidden("You can delete images only for cars created by you.");
            }

            image.CarImageDeleted = true;
            image.CarImageDeletedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ServiceResult<CarImage>.Success(image);
        }

        private async Task ClearMainImages(int carId)
        {
            var existingMainImages = await _context.CarImages
                .Where(ci => ci.CarID == carId && !ci.CarImageDeleted && ci.CarImageIsMain)
                .ToListAsync();

            foreach (var existingImage in existingMainImages)
            {
                existingImage.CarImageIsMain = false;
            }
        }
    }
}
