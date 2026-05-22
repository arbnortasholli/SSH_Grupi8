using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace AutoKosova.Business.Services
{
    public class CarService
    {
        private readonly AppDbContext _context;
        private readonly LocalImageStorageService _localImageStorageService;

        public CarService(
            AppDbContext context,
            LocalImageStorageService localImageStorageService)
        {
            _context = context;
            _localImageStorageService = localImageStorageService;
        }

        public async Task<List<Cars>> GetAll()
        {
            return await BaseCarQuery()
                .OrderByDescending(c => c.CarCreationDate)
                .ToListAsync();
        }

        public async Task<ServiceResult<Cars>> GetById(int id)
        {
            var car = await BaseCarQuery()
                .Where(c => c.CarsID == id)
                .FirstOrDefaultAsync();

            if (car == null)
            {
                return ServiceResult<Cars>.NotFound("Car not found.");
            }

            return ServiceResult<Cars>.Success(car);
        }

        public async Task<ServiceResult<Cars>> Create(Cars car, List<IFormFile>? images = null)
        {
            var validationError = ValidateCar(car);

            if (validationError != null)
            {
                return ServiceResult<Cars>.BadRequest(validationError);
            }

            var imagesValidationError = await ValidateImagesForCreate(images);

            if (imagesValidationError != null)
            {
                return ServiceResult<Cars>.BadRequest(imagesValidationError);
            }

            var tenantValidationError = await ValidateTenant(car.TenantID);

            if (tenantValidationError != null)
            {
                return ServiceResult<Cars>.BadRequest(tenantValidationError);
            }

            var accountValidationError = await ValidateAccount(car.CreatedByAccountID);

            if (accountValidationError != null)
            {
                return ServiceResult<Cars>.BadRequest(accountValidationError);
            }

            car.CarTitle = car.CarTitle.Trim();
            car.CarBrand = car.CarBrand.Trim();
            car.CarModel = car.CarModel.Trim();
            car.CarCreationDate = DateTime.UtcNow;
            car.CarDeleted = false;

            if (car.IsForSale)
            {
                car.RentalDailyPrice = null;
            }
            else if (car.IsForRent)
            {
                car.SalePrice = null;
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();

            var savedFilePaths = new List<string>();

            try
            {
                _context.Cars.Add(car);
                await _context.SaveChangesAsync();

                if (images is { Count: > 0 })
                {
                    savedFilePaths = await AddUploadedImages(car, images);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();

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

                return ServiceResult<Cars>.BadRequest($"Failed to save images: {ex.Message}");
            }

            return ServiceResult<Cars>.Success(car);
        }

        public async Task<ServiceResult<Cars>> Update(int id, Cars updatedCar)
        {
            var car = await _context.Cars
                .FirstOrDefaultAsync(c => c.CarsID == id && !c.CarDeleted);

            if (car == null)
            {
                return ServiceResult<Cars>.NotFound("Car not found.");
            }

            var validationError = ValidateCar(updatedCar);

            if (validationError != null)
            {
                return ServiceResult<Cars>.BadRequest(validationError);
            }

            var tenantValidationError = await ValidateTenant(updatedCar.TenantID);

            if (tenantValidationError != null)
            {
                return ServiceResult<Cars>.BadRequest(tenantValidationError);
            }

            car.TenantID = updatedCar.TenantID;
            car.CarTitle = updatedCar.CarTitle.Trim();
            car.CarBrand = updatedCar.CarBrand.Trim();
            car.CarModel = updatedCar.CarModel.Trim();
            car.CarYear = updatedCar.CarYear;
            car.CarMileage = updatedCar.CarMileage;
            car.CarFuelType = updatedCar.CarFuelType;
            car.CarTransmission = updatedCar.CarTransmission;
            car.CarBodyType = updatedCar.CarBodyType;
            car.CarColor = updatedCar.CarColor;
            car.CarDescription = updatedCar.CarDescription;
            car.IsForSale = updatedCar.IsForSale;
            car.SalePrice = updatedCar.IsForSale ? updatedCar.SalePrice : null;
            car.IsForRent = updatedCar.IsForRent;
            car.RentalDailyPrice = updatedCar.IsForRent ? updatedCar.RentalDailyPrice : null;
            car.CarStatus = updatedCar.CarStatus;
            car.CarUpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ServiceResult<Cars>.Success(car);
        }

        public async Task<ServiceResult<Cars>> Delete(int id)
        {
            var car = await _context.Cars
                .FirstOrDefaultAsync(c => c.CarsID == id && !c.CarDeleted);

            if (car == null)
            {
                return ServiceResult<Cars>.NotFound("Car not found.");
            }

            car.CarDeleted = true;
            car.CarDeletedDate = DateTime.UtcNow;

            try
            {
                _localImageStorageService.DeleteCarFolder(id);
            }
            catch
            {
                // Soft delete preferred, file deletion failure shouldn't block
            }

            await _context.SaveChangesAsync();

            return ServiceResult<Cars>.Success(car);
        }

        public async Task<List<Cars>> GetForSale()
        {
            return await BaseCarQuery()
                .Where(c => c.IsForSale)
                .OrderByDescending(c => c.CarCreationDate)
                .ToListAsync();
        }

        public async Task<List<Cars>> GetForRent()
        {
            return await BaseCarQuery()
                .Where(c => c.IsForRent)
                .OrderByDescending(c => c.CarCreationDate)
                .ToListAsync();
        }

        public async Task<(int PageNumber, int PageSize, int TotalRecords, int TotalPages, List<Cars> Data)> Search(
            string? searchTerm,
            string? brand,
            string? model,
            int? minYear,
            int? maxYear,
            int? maxMileage,
            string? fuelType,
            string? transmission,
            string? bodyType,
            string? color,
            bool? isForSale,
            bool? isForRent,
            decimal? minPrice,
            decimal? maxPrice,
            string? status,
            int pageNumber,
            int pageSize)
        {
            var query = ApplySearch(
                BaseCarQuery(),
                searchTerm,
                brand,
                model,
                minYear,
                maxYear,
                maxMileage,
                fuelType,
                transmission,
                bodyType,
                color,
                isForSale,
                isForRent,
                minPrice,
                maxPrice,
                status);
            pageNumber = pageNumber <= 0 ? 1 : pageNumber;
            pageSize = pageSize <= 0 ? 10 : pageSize;
            pageSize = pageSize > 50 ? 50 : pageSize;

            var totalRecords = await query.CountAsync();
            var cars = await query
                .OrderByDescending(c => c.CarCreationDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (pageNumber, pageSize, totalRecords, (int)Math.Ceiling(totalRecords / (double)pageSize), cars);
        }

        public async Task<List<Cars>> GetMyCars(int accountId)
        {
            return await BaseCarQuery()
                .Where(c => c.CreatedByAccountID == accountId)
                .OrderByDescending(c => c.CarCreationDate)
                .ToListAsync();
        }

        private async Task<string?> ValidateAccount(int accountId)
        {
            if (accountId <= 0)
            {
                return "Created by account is required.";
            }

            var accountExists = await _context.Accounts
                .AnyAsync(a => a.AccountID == accountId && !a.AccountDeleted);

            return accountExists ? null : "Invalid account.";
        }

        public async Task<List<Cars>> GetByTenant(int tenantId)
        {
            return await BaseCarQuery()
                .Where(c => c.TenantID == tenantId)
                .OrderByDescending(c => c.CarCreationDate)
                .ToListAsync();
        }

        private IQueryable<Cars> BaseCarQuery()
        {
            return _context.Cars
                .Include(c => c.CarImages.Where(ci => !ci.CarImageDeleted))
                .Where(c => !c.CarDeleted);
        }

        private async Task<string?> ValidateImagesForCreate(List<IFormFile>? images)
        {
            if (images == null || images.Count == 0)
            {
                return null;
            }

            if (images.Count > 10)
            {
                return "A car can have a maximum of 10 images.";
            }

            foreach (var image in images)
            {
                var validationError = _localImageStorageService.ValidateImage(image);
                if (validationError != null)
                {
                    return validationError;
                }
            }

            return null;
        }

        private async Task<List<string>> AddUploadedImages(Cars car, List<IFormFile> images)
        {
            var savedFilePaths = new List<string>();
            var orderNumber = 1;
            foreach (var image in images)
            {
                var relativePath = await _localImageStorageService.SaveImageAsync(image, car.CarsID);
                savedFilePaths.Add(relativePath);

                car.CarImages.Add(new CarImage
                {
                    CarID = car.CarsID,
                    CarImageUrl = relativePath,
                    CarImageOriginalFileName = Path.GetFileName(image.FileName),
                    CarImageContentType = image.ContentType,
                    CarImageSizeBytes = image.Length,
                    CarImageIsMain = orderNumber == 1,
                    CarImageOrderNumber = orderNumber,
                    CarImageCreationDate = DateTime.UtcNow,
                    CarImageDeleted = false
                });

                orderNumber++;
            }

            return savedFilePaths;
        }

        private async Task<string?> ValidateTenant(int? tenantId)
        {
            if (!tenantId.HasValue)
            {
                return null;
            }

            var tenantExists = await _context.Tenants
                .AnyAsync(t => t.TenantID == tenantId.Value);

            return tenantExists ? null : "Invalid tenant.";
        }

        private static IQueryable<Cars> ApplySearch(
            IQueryable<Cars> query,
            string? searchTerm,
            string? brand,
            string? model,
            int? minYear,
            int? maxYear,
            int? maxMileage,
            string? fuelType,
            string? transmission,
            string? bodyType,
            string? color,
            bool? isForSale,
            bool? isForRent,
            decimal? minPrice,
            decimal? maxPrice,
            string? status)
        {
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                searchTerm = searchTerm.Trim().ToLower();

                query = query.Where(c =>
                    c.CarTitle.ToLower().Contains(searchTerm) ||
                    c.CarBrand.ToLower().Contains(searchTerm) ||
                    c.CarModel.ToLower().Contains(searchTerm) ||
                    (c.CarDescription != null && c.CarDescription.ToLower().Contains(searchTerm)));
            }

            if (!string.IsNullOrWhiteSpace(brand))
            {
                brand = brand.Trim().ToLower();
                query = query.Where(c => c.CarBrand.ToLower() == brand);
            }

            if (!string.IsNullOrWhiteSpace(model))
            {
                model = model.Trim().ToLower();
                query = query.Where(c => c.CarModel.ToLower() == model);
            }

            if (minYear.HasValue)
            {
                query = query.Where(c => c.CarYear >= minYear.Value);
            }

            if (maxYear.HasValue)
            {
                query = query.Where(c => c.CarYear <= maxYear.Value);
            }

            if (maxMileage.HasValue)
            {
                query = query.Where(c => c.CarMileage <= maxMileage.Value);
            }

            if (!string.IsNullOrWhiteSpace(fuelType))
            {
                fuelType = fuelType.Trim().ToLower();
                query = query.Where(c => c.CarFuelType != null && c.CarFuelType.ToLower() == fuelType);
            }

            if (!string.IsNullOrWhiteSpace(transmission))
            {
                transmission = transmission.Trim().ToLower();
                query = query.Where(c => c.CarTransmission != null && c.CarTransmission.ToLower() == transmission);
            }

            if (!string.IsNullOrWhiteSpace(bodyType))
            {
                bodyType = bodyType.Trim().ToLower();
                query = query.Where(c => c.CarBodyType != null && c.CarBodyType.ToLower() == bodyType);
            }

            if (!string.IsNullOrWhiteSpace(color))
            {
                color = color.Trim().ToLower();
                query = query.Where(c => c.CarColor != null && c.CarColor.ToLower() == color);
            }

            if (isForSale.HasValue)
            {
                query = query.Where(c => c.IsForSale == isForSale.Value);
            }

            if (isForRent.HasValue)
            {
                query = query.Where(c => c.IsForRent == isForRent.Value);
            }

            if (minPrice.HasValue)
            {
                query = query.Where(c =>
                    (c.IsForSale && c.SalePrice >= minPrice.Value) ||
                    (c.IsForRent && c.RentalDailyPrice >= minPrice.Value));
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(c =>
                    (c.IsForSale && c.SalePrice <= maxPrice.Value) ||
                    (c.IsForRent && c.RentalDailyPrice <= maxPrice.Value));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                status = status.Trim().ToLower();
                query = query.Where(c => c.CarStatus.ToLower() == status);
            }

            return query;
        }

        private static string? ValidateCar(Cars car)
        {
            if (string.IsNullOrWhiteSpace(car.CarTitle))
            {
                return "Car title is required.";
            }

            if (string.IsNullOrWhiteSpace(car.CarBrand))
            {
                return "Car brand is required.";
            }

            if (string.IsNullOrWhiteSpace(car.CarModel))
            {
                return "Car model is required.";
            }

            if (car.CarYear < 1950 || car.CarYear > DateTime.UtcNow.Year + 1)
            {
                return "Invalid car year.";
            }

            if (car.IsForSale && car.IsForRent)
            {
                return "A car cannot be both for sale and for rent.";
            }

            if (!car.IsForSale && !car.IsForRent)
            {
                return "Car must be either for sale or for rent.";
            }

            if (car.IsForSale)
            {
                if (!car.SalePrice.HasValue || car.SalePrice.Value <= 0)
                {
                    return "Sale price is required and must be greater than 0.";
                }

                if (!CarStatuses.SaleStatuses.Contains(car.CarStatus))
                {
                    return $"Invalid status '{car.CarStatus}' for a car for sale.";
                }
            }

            if (car.IsForRent)
            {
                if (!car.RentalDailyPrice.HasValue || car.RentalDailyPrice.Value <= 0)
                {
                    return "Rental daily price is required and must be greater than 0.";
                }

                if (!CarStatuses.RentStatuses.Contains(car.CarStatus))
                {
                    return $"Invalid status '{car.CarStatus}' for a rental car.";
                }
            }

            return null;
        }
    }
}
