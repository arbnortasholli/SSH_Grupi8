using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace AutoKosova.Business.Services
{
    public class CarImageService
    {
        private readonly AppDbContext _context;
        private readonly LocalImageStorageService _localImageStorageService;

        public CarImageService(
            AppDbContext context,
            LocalImageStorageService localImageStorageService)
        {
            _context = context;
            _localImageStorageService = localImageStorageService;
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
            int carImageOrderNumber)
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

        public async Task<ServiceResult<List<CarImage>>> UploadImages(
            int carId,
            List<IFormFile>? images,
            int? mainImageIndex = null)
        {
            if (images == null || images.Count == 0)
            {
                return ServiceResult<List<CarImage>>.BadRequest("At least one image is required.");
            }

            var car = await _context.Cars
                .Include(c => c.CarImages.Where(ci => !ci.CarImageDeleted))
                .FirstOrDefaultAsync(c => c.CarsID == carId && !c.CarDeleted);

            if (car == null)
            {
                return ServiceResult<List<CarImage>>.NotFound("Car not found.");
            }

            var existingImageCount = car.CarImages.Count;
            if (existingImageCount + images.Count > 10)
            {
                return ServiceResult<List<CarImage>>.BadRequest("A car can have a maximum of 10 images.");
            }

            foreach (var file in images)
            {
                var validationError = _localImageStorageService.ValidateImage(file);
                if (validationError != null)
                {
                    return ServiceResult<List<CarImage>>.BadRequest(validationError);
                }
            }

            if (string.IsNullOrWhiteSpace(car.CarTitle))
            {
                 // car.GoogleDriveFolderId logic is gone
            }

            var makeNewMain = !car.CarImages.Any(ci => ci.CarImageIsMain);
            if (mainImageIndex.HasValue && (mainImageIndex.Value < 0 || mainImageIndex.Value >= images.Count))
            {
                return ServiceResult<List<CarImage>>.BadRequest("Invalid main image index.");
            }

            if (mainImageIndex.HasValue || makeNewMain)
            {
                await ClearMainImages(carId);
            }

            var maxOrder = car.CarImages.Count == 0 ? 0 : car.CarImages.Max(ci => ci.CarImageOrderNumber);
            var createdImages = new List<CarImage>();
            var savedFilePaths = new List<string>();

            try
            {
                for (var index = 0; index < images.Count; index++)
                {
                    var file = images[index];
                    var relativePath = await _localImageStorageService.SaveImageAsync(file, carId);
                    savedFilePaths.Add(relativePath);

                    var isMain = mainImageIndex.HasValue
                        ? mainImageIndex.Value == index
                        : makeNewMain && index == 0;

                    var image = new CarImage
                    {
                        CarID = carId,
                        Car = car,
                        CarImageUrl = relativePath,
                        CarImageOriginalFileName = Path.GetFileName(file.FileName),
                        CarImageContentType = file.ContentType,
                        CarImageSizeBytes = file.Length,
                        CarImageIsMain = isMain,
                        CarImageOrderNumber = maxOrder + index + 1,
                        CarImageCreationDate = DateTime.UtcNow,
                        CarImageDeleted = false
                    };

                    _context.CarImages.Add(image);
                    createdImages.Add(image);
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                foreach (var path in savedFilePaths)
                {
                    try
                    {
                        _localImageStorageService.DeleteImage(path);
                    }
                    catch
                    {
                    }
                }

                return ServiceResult<List<CarImage>>.BadRequest($"Failed to save local image: {ex.Message}");
            }

            return ServiceResult<List<CarImage>>.Success(createdImages);
        }

        public async Task<ServiceResult<CarImage>> SetMainImage(int carId, int imageId)
        {
            var image = await _context.CarImages
                .Include(ci => ci.Car)
                .FirstOrDefaultAsync(ci =>
                    ci.CarID == carId &&
                    ci.CarImageID == imageId &&
                    !ci.CarImageDeleted);

            if (image == null)
            {
                return ServiceResult<CarImage>.NotFound("Car image not found.");
            }

            if (image.Car == null || image.Car.CarDeleted)
            {
                return ServiceResult<CarImage>.NotFound("Car not found.");
            }

            await ClearMainImages(image.CarID);
            image.CarImageIsMain = true;

            await _context.SaveChangesAsync();

            return ServiceResult<CarImage>.Success(image);
        }

        public async Task<ServiceResult<CarImage>> SetMainImage(int imageId)
        {
            var image = await _context.CarImages
                .Where(ci => ci.CarImageID == imageId && !ci.CarImageDeleted)
                .FirstOrDefaultAsync();

            return image == null
                ? ServiceResult<CarImage>.NotFound("Car image not found.")
                : await SetMainImage(image.CarID, imageId);
        }

        public async Task<ServiceResult<List<CarImage>>> ReorderImages(int carId, Dictionary<int, int> imageOrders)
        {
            var carExists = await _context.Cars
                .AnyAsync(c => c.CarsID == carId && !c.CarDeleted);

            if (!carExists)
            {
                return ServiceResult<List<CarImage>>.NotFound("Car not found.");
            }

            if (imageOrders.Count == 0)
            {
                return ServiceResult<List<CarImage>>.BadRequest("At least one image order is required.");
            }

            var imageIds = imageOrders.Keys.ToList();
            var images = await _context.CarImages
                .Where(ci => ci.CarID == carId && imageIds.Contains(ci.CarImageID) && !ci.CarImageDeleted)
                .ToListAsync();

            if (images.Count != imageIds.Count)
            {
                return ServiceResult<List<CarImage>>.BadRequest("One or more images do not belong to this car.");
            }

            foreach (var image in images)
            {
                image.CarImageOrderNumber = imageOrders[image.CarImageID];
            }

            await _context.SaveChangesAsync();

            return await GetImagesByCarId(carId);
        }

        public async Task<ServiceResult<CarImage>> DeleteImage(int carId, int imageId, bool deleteLocalFile = true)
        {
            var image = await _context.CarImages
                .Include(ci => ci.Car)
                .FirstOrDefaultAsync(ci =>
                    ci.CarID == carId &&
                    ci.CarImageID == imageId &&
                    !ci.CarImageDeleted);

            if (image == null)
            {
                return ServiceResult<CarImage>.NotFound("Car image not found.");
            }

            if (image.Car == null || image.Car.CarDeleted)
            {
                return ServiceResult<CarImage>.NotFound("Car not found.");
            }

            image.CarImageDeleted = true;
            image.CarImageDeletedDate = DateTime.UtcNow;
            var deletedImageWasMain = image.CarImageIsMain;
            image.CarImageIsMain = false;

            if (deleteLocalFile && !string.IsNullOrWhiteSpace(image.CarImageUrl))
            {
                try
                {
                    _localImageStorageService.DeleteImage(image.CarImageUrl);
                }
                catch
                {
                    // The DB soft-delete is the source of truth. A file delete failure should not block the UI.
                }
            }

            if (deletedImageWasMain)
            {
                var nextMainImage = await _context.CarImages
                    .Where(ci => ci.CarID == carId && ci.CarImageID != imageId && !ci.CarImageDeleted)
                    .OrderBy(ci => ci.CarImageOrderNumber)
                    .FirstOrDefaultAsync();

                if (nextMainImage != null)
                {
                    nextMainImage.CarImageIsMain = true;
                }
            }

            await _context.SaveChangesAsync();

            return ServiceResult<CarImage>.Success(image);
        }

        public async Task<ServiceResult<CarImage>> DeleteImage(int imageId)
        {
            var image = await _context.CarImages
                .Where(ci => ci.CarImageID == imageId && !ci.CarImageDeleted)
                .FirstOrDefaultAsync();

            return image == null
                ? ServiceResult<CarImage>.NotFound("Car image not found.")
                : await DeleteImage(image.CarID, imageId);
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
