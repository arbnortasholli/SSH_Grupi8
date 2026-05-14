using AutoKosova.Business.Models;
using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace AutoKosova.Business.Services
{
    public class CarImageService
    {
        private readonly AppDbContext _context;

        public CarImageService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<List<CarImageModel>>> GetImagesByCarId(int carId)
        {
            var carExists = await _context.Cars
                .AnyAsync(c => c.CarsID == carId && !c.CarDeleted);

            if (!carExists)
            {
                return ServiceResult<List<CarImageModel>>.NotFound("Car not found.");
            }

            var images = await _context.CarImages
                .Where(ci => ci.CarID == carId && !ci.CarImageDeleted)
                .OrderByDescending(ci => ci.CarImageIsMain)
                .ThenBy(ci => ci.CarImageOrderNumber)
                .Select(ModelProjection)
                .ToListAsync();

            return ServiceResult<List<CarImageModel>>.Success(images);
        }

        public async Task<ServiceResult<CarImageModel>> GetImageById(int imageId)
        {
            var image = await _context.CarImages
                .Where(ci => ci.CarImageID == imageId && !ci.CarImageDeleted)
                .Select(ModelProjection)
                .FirstOrDefaultAsync();

            if (image == null)
            {
                return ServiceResult<CarImageModel>.NotFound("Car image not found.");
            }

            return ServiceResult<CarImageModel>.Success(image);
        }

        public async Task<ServiceResult<CarImageMutationResult>> AddImage(
            int carId,
            CarImageCreateCommand command,
            int accountId,
            string? role)
        {
            if (string.IsNullOrWhiteSpace(command.CarImageUrl))
            {
                return ServiceResult<CarImageMutationResult>.BadRequest("Car image URL is required.");
            }

            var car = await _context.Cars
                .FirstOrDefaultAsync(c => c.CarsID == carId && !c.CarDeleted);

            if (car == null)
            {
                return ServiceResult<CarImageMutationResult>.NotFound("Car not found.");
            }

            if (role != "Admin" && car.CreatedByAccountID != accountId)
            {
                return ServiceResult<CarImageMutationResult>.Forbidden("You can add images only to cars created by you.");
            }

            if (command.CarImageIsMain)
            {
                await ClearMainImages(carId);
            }

            var image = new CarImage
            {
                CarID = carId,
                Car = car,
                CarImageUrl = command.CarImageUrl.Trim(),
                CarImageIsMain = command.CarImageIsMain,
                CarImageOrderNumber = command.CarImageOrderNumber,
                CarImageCreationDate = DateTime.UtcNow,
                CarImageDeleted = false
            };

            _context.CarImages.Add(image);
            await _context.SaveChangesAsync();

            return ServiceResult<CarImageMutationResult>.Success(new CarImageMutationResult
            {
                CarImageID = image.CarImageID
            });
        }

        public async Task<ServiceResult<CarImageMutationResult>> SetMainImage(int imageId, int accountId, string? role)
        {
            var image = await _context.CarImages
                .Include(ci => ci.Car)
                .FirstOrDefaultAsync(ci => ci.CarImageID == imageId && !ci.CarImageDeleted);

            if (image == null)
            {
                return ServiceResult<CarImageMutationResult>.NotFound("Car image not found.");
            }

            if (image.Car == null || image.Car.CarDeleted)
            {
                return ServiceResult<CarImageMutationResult>.NotFound("Car not found.");
            }

            if (role != "Admin" && image.Car.CreatedByAccountID != accountId)
            {
                return ServiceResult<CarImageMutationResult>.Forbidden("You can update images only for cars created by you.");
            }

            await ClearMainImages(image.CarID);
            image.CarImageIsMain = true;

            await _context.SaveChangesAsync();

            return ServiceResult<CarImageMutationResult>.Success(new CarImageMutationResult
            {
                CarImageID = image.CarImageID
            });
        }

        public async Task<ServiceResult<CarImageMutationResult>> DeleteImage(int imageId, int accountId, string? role)
        {
            var image = await _context.CarImages
                .Include(ci => ci.Car)
                .FirstOrDefaultAsync(ci => ci.CarImageID == imageId && !ci.CarImageDeleted);

            if (image == null)
            {
                return ServiceResult<CarImageMutationResult>.NotFound("Car image not found.");
            }

            if (image.Car == null || image.Car.CarDeleted)
            {
                return ServiceResult<CarImageMutationResult>.NotFound("Car not found.");
            }

            if (role != "Admin" && image.Car.CreatedByAccountID != accountId)
            {
                return ServiceResult<CarImageMutationResult>.Forbidden("You can delete images only for cars created by you.");
            }

            image.CarImageDeleted = true;
            image.CarImageDeletedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ServiceResult<CarImageMutationResult>.Success(new CarImageMutationResult
            {
                CarImageID = image.CarImageID
            });
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

        private static readonly Expression<Func<CarImage, CarImageModel>> ModelProjection = image => new CarImageModel
        {
            CarImageID = image.CarImageID,
            CarID = image.CarID,
            CarImageUrl = image.CarImageUrl,
            CarImageIsMain = image.CarImageIsMain,
            CarImageOrderNumber = image.CarImageOrderNumber,
            CarImageCreationDate = image.CarImageCreationDate
        };
    }
}
