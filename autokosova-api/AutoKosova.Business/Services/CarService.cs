using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.EntityFrameworkCore;

namespace AutoKosova.Business.Services
{
    public class CarService
    {
        private readonly AppDbContext _context;

        public CarService(AppDbContext context)
        {
            _context = context;
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

        public async Task<ServiceResult<Cars>> Create(Cars car, int accountId)
        {
            var validationError = ValidateCar(car);

            if (validationError != null)
            {
                return ServiceResult<Cars>.BadRequest(validationError);
            }

            var tenantValidationError = await ValidateTenant(car.TenantID);

            if (tenantValidationError != null)
            {
                return ServiceResult<Cars>.BadRequest(tenantValidationError);
            }

            car.CreatedByAccountID = accountId;
            car.CarTitle = car.CarTitle.Trim();
            car.CarBrand = car.CarBrand.Trim();
            car.CarModel = car.CarModel.Trim();
            car.CarCreationDate = DateTime.UtcNow;
            car.CarDeleted = false;

            _context.Cars.Add(car);
            await _context.SaveChangesAsync();

            return ServiceResult<Cars>.Success(car);
        }

        public async Task<ServiceResult<Cars>> Update(int id, Cars updatedCar, int accountId, string? role)
        {
            var car = await _context.Cars
                .FirstOrDefaultAsync(c => c.CarsID == id && !c.CarDeleted);

            if (car == null)
            {
                return ServiceResult<Cars>.NotFound("Car not found.");
            }

            if (role != "SuperAdmin" && car.CreatedByAccountID != accountId)
            {
                return ServiceResult<Cars>.Forbidden("You can update only cars created by you.");
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
            car.SalePrice = updatedCar.SalePrice;
            car.IsForRent = updatedCar.IsForRent;
            car.RentalDailyPrice = updatedCar.RentalDailyPrice;
            car.CarStatus = updatedCar.CarStatus;
            car.CarUpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ServiceResult<Cars>.Success(car);
        }

        public async Task<ServiceResult<Cars>> Delete(int id, int accountId, string? role)
        {
            var car = await _context.Cars
                .FirstOrDefaultAsync(c => c.CarsID == id && !c.CarDeleted);

            if (car == null)
            {
                return ServiceResult<Cars>.NotFound("Car not found.");
            }

            if (role != "SuperAdmin" && car.CreatedByAccountID != accountId)
            {
                return ServiceResult<Cars>.Forbidden("You can delete only cars created by you.");
            }

            car.CarDeleted = true;
            car.CarDeletedDate = DateTime.UtcNow;

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

        public async Task<List<Cars>> GetByTenant(int tenantId)
        {
            return await BaseCarQuery()
                .Where(c => c.TenantID == tenantId)
                .OrderByDescending(c => c.CarCreationDate)
                .ToListAsync();
        }

        private IQueryable<Cars> BaseCarQuery()
        {
            return _context.Cars.Where(c => !c.CarDeleted);
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

            if (!car.IsForSale && !car.IsForRent)
            {
                return "Car must be marked for sale or rent.";
            }

            if (car.IsForSale && (!car.SalePrice.HasValue || car.SalePrice.Value <= 0))
            {
                return "Sale price is required when car is for sale.";
            }

            if (car.IsForRent && (!car.RentalDailyPrice.HasValue || car.RentalDailyPrice.Value <= 0))
            {
                return "Rental daily price is required when car is for rent.";
            }

            return null;
        }
    }
}
