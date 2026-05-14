using AutoKosova.Business.Models;
using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace AutoKosova.Business.Services
{
    public class CarService
    {
        private readonly AppDbContext _context;

        public CarService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<CarListModel>> GetAll()
        {
            return await BaseCarQuery()
                .OrderByDescending(c => c.CarCreationDate)
                .Select(ListProjection)
                .ToListAsync();
        }

        public async Task<ServiceResult<CarDetailsModel>> GetById(int id)
        {
            var car = await BaseCarQuery()
                .Where(c => c.CarsID == id)
                .Select(DetailsProjection)
                .FirstOrDefaultAsync();

            if (car == null)
            {
                return ServiceResult<CarDetailsModel>.NotFound("Car not found.");
            }

            return ServiceResult<CarDetailsModel>.Success(car);
        }

        public async Task<ServiceResult<CarMutationResult>> Create(CarWriteCommand command, int accountId)
        {
            var validationError = ValidateCar(command);

            if (validationError != null)
            {
                return ServiceResult<CarMutationResult>.BadRequest(validationError);
            }

            var tenantValidationError = await ValidateTenant(command.TenantID);

            if (tenantValidationError != null)
            {
                return ServiceResult<CarMutationResult>.BadRequest(tenantValidationError);
            }

            var car = new Cars
            {
                TenantID = command.TenantID,
                CreatedByAccountID = accountId,
                CarTitle = command.CarTitle.Trim(),
                CarBrand = command.CarBrand.Trim(),
                CarModel = command.CarModel.Trim(),
                CarYear = command.CarYear,
                CarMileage = command.CarMileage,
                CarFuelType = command.CarFuelType,
                CarTransmission = command.CarTransmission,
                CarBodyType = command.CarBodyType,
                CarColor = command.CarColor,
                CarDescription = command.CarDescription,
                IsForSale = command.IsForSale,
                SalePrice = command.SalePrice,
                IsForRent = command.IsForRent,
                RentalDailyPrice = command.RentalDailyPrice,
                CarStatus = command.CarStatus,
                CarCreationDate = DateTime.UtcNow,
                CarDeleted = false
            };

            _context.Cars.Add(car);
            await _context.SaveChangesAsync();

            return ServiceResult<CarMutationResult>.Success(new CarMutationResult
            {
                CarID = car.CarsID
            });
        }

        public async Task<ServiceResult<CarMutationResult>> Update(int id, CarWriteCommand command, int accountId, string? role)
        {
            var car = await _context.Cars
                .FirstOrDefaultAsync(c => c.CarsID == id && !c.CarDeleted);

            if (car == null)
            {
                return ServiceResult<CarMutationResult>.NotFound("Car not found.");
            }

            if (role != "Admin" && car.CreatedByAccountID != accountId)
            {
                return ServiceResult<CarMutationResult>.Forbidden("You can update only cars created by you.");
            }

            var validationError = ValidateCar(command);

            if (validationError != null)
            {
                return ServiceResult<CarMutationResult>.BadRequest(validationError);
            }

            var tenantValidationError = await ValidateTenant(command.TenantID);

            if (tenantValidationError != null)
            {
                return ServiceResult<CarMutationResult>.BadRequest(tenantValidationError);
            }

            car.TenantID = command.TenantID;
            car.CarTitle = command.CarTitle.Trim();
            car.CarBrand = command.CarBrand.Trim();
            car.CarModel = command.CarModel.Trim();
            car.CarYear = command.CarYear;
            car.CarMileage = command.CarMileage;
            car.CarFuelType = command.CarFuelType;
            car.CarTransmission = command.CarTransmission;
            car.CarBodyType = command.CarBodyType;
            car.CarColor = command.CarColor;
            car.CarDescription = command.CarDescription;
            car.IsForSale = command.IsForSale;
            car.SalePrice = command.SalePrice;
            car.IsForRent = command.IsForRent;
            car.RentalDailyPrice = command.RentalDailyPrice;
            car.CarStatus = command.CarStatus;
            car.CarUpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ServiceResult<CarMutationResult>.Success(new CarMutationResult
            {
                CarID = car.CarsID
            });
        }

        public async Task<ServiceResult<CarMutationResult>> Delete(int id, int accountId, string? role)
        {
            var car = await _context.Cars
                .FirstOrDefaultAsync(c => c.CarsID == id && !c.CarDeleted);

            if (car == null)
            {
                return ServiceResult<CarMutationResult>.NotFound("Car not found.");
            }

            if (role != "Admin" && car.CreatedByAccountID != accountId)
            {
                return ServiceResult<CarMutationResult>.Forbidden("You can delete only cars created by you.");
            }

            car.CarDeleted = true;
            car.CarDeletedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ServiceResult<CarMutationResult>.Success(new CarMutationResult
            {
                CarID = car.CarsID
            });
        }

        public async Task<List<CarListModel>> GetForSale()
        {
            return await BaseCarQuery()
                .Where(c => c.IsForSale)
                .OrderByDescending(c => c.CarCreationDate)
                .Select(ListProjection)
                .ToListAsync();
        }

        public async Task<List<CarListModel>> GetForRent()
        {
            return await BaseCarQuery()
                .Where(c => c.IsForRent)
                .OrderByDescending(c => c.CarCreationDate)
                .Select(ListProjection)
                .ToListAsync();
        }

        public async Task<PagedResult<CarListModel>> Search(CarSearchCommand command)
        {
            var query = ApplySearch(BaseCarQuery(), command);
            var pageNumber = command.PageNumber <= 0 ? 1 : command.PageNumber;
            var pageSize = command.PageSize <= 0 ? 10 : command.PageSize;
            pageSize = pageSize > 50 ? 50 : pageSize;

            var totalRecords = await query.CountAsync();
            var cars = await query
                .OrderByDescending(c => c.CarCreationDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(ListProjection)
                .ToListAsync();

            return new PagedResult<CarListModel>
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalRecords = totalRecords,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize),
                Data = cars
            };
        }

        public async Task<List<CarListModel>> GetMyCars(int accountId)
        {
            return await BaseCarQuery()
                .Where(c => c.CreatedByAccountID == accountId)
                .OrderByDescending(c => c.CarCreationDate)
                .Select(ListProjection)
                .ToListAsync();
        }

        public async Task<List<CarListModel>> GetByTenant(int tenantId)
        {
            return await BaseCarQuery()
                .Where(c => c.TenantID == tenantId)
                .OrderByDescending(c => c.CarCreationDate)
                .Select(ListProjection)
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

        private static IQueryable<Cars> ApplySearch(IQueryable<Cars> query, CarSearchCommand command)
        {
            if (!string.IsNullOrWhiteSpace(command.SearchTerm))
            {
                var searchTerm = command.SearchTerm.Trim().ToLower();

                query = query.Where(c =>
                    c.CarTitle.ToLower().Contains(searchTerm) ||
                    c.CarBrand.ToLower().Contains(searchTerm) ||
                    c.CarModel.ToLower().Contains(searchTerm) ||
                    (c.CarDescription != null && c.CarDescription.ToLower().Contains(searchTerm)));
            }

            if (!string.IsNullOrWhiteSpace(command.Brand))
            {
                var brand = command.Brand.Trim().ToLower();
                query = query.Where(c => c.CarBrand.ToLower() == brand);
            }

            if (!string.IsNullOrWhiteSpace(command.Model))
            {
                var model = command.Model.Trim().ToLower();
                query = query.Where(c => c.CarModel.ToLower() == model);
            }

            if (command.MinYear.HasValue)
            {
                query = query.Where(c => c.CarYear >= command.MinYear.Value);
            }

            if (command.MaxYear.HasValue)
            {
                query = query.Where(c => c.CarYear <= command.MaxYear.Value);
            }

            if (command.MaxMileage.HasValue)
            {
                query = query.Where(c => c.CarMileage <= command.MaxMileage.Value);
            }

            if (!string.IsNullOrWhiteSpace(command.FuelType))
            {
                var fuelType = command.FuelType.Trim().ToLower();
                query = query.Where(c => c.CarFuelType != null && c.CarFuelType.ToLower() == fuelType);
            }

            if (!string.IsNullOrWhiteSpace(command.Transmission))
            {
                var transmission = command.Transmission.Trim().ToLower();
                query = query.Where(c => c.CarTransmission != null && c.CarTransmission.ToLower() == transmission);
            }

            if (!string.IsNullOrWhiteSpace(command.BodyType))
            {
                var bodyType = command.BodyType.Trim().ToLower();
                query = query.Where(c => c.CarBodyType != null && c.CarBodyType.ToLower() == bodyType);
            }

            if (!string.IsNullOrWhiteSpace(command.Color))
            {
                var color = command.Color.Trim().ToLower();
                query = query.Where(c => c.CarColor != null && c.CarColor.ToLower() == color);
            }

            if (command.IsForSale.HasValue)
            {
                query = query.Where(c => c.IsForSale == command.IsForSale.Value);
            }

            if (command.IsForRent.HasValue)
            {
                query = query.Where(c => c.IsForRent == command.IsForRent.Value);
            }

            if (command.MinPrice.HasValue)
            {
                query = query.Where(c =>
                    (c.IsForSale && c.SalePrice >= command.MinPrice.Value) ||
                    (c.IsForRent && c.RentalDailyPrice >= command.MinPrice.Value));
            }

            if (command.MaxPrice.HasValue)
            {
                query = query.Where(c =>
                    (c.IsForSale && c.SalePrice <= command.MaxPrice.Value) ||
                    (c.IsForRent && c.RentalDailyPrice <= command.MaxPrice.Value));
            }

            if (!string.IsNullOrWhiteSpace(command.Status))
            {
                var status = command.Status.Trim().ToLower();
                query = query.Where(c => c.CarStatus.ToLower() == status);
            }

            return query;
        }

        private static string? ValidateCar(CarWriteCommand command)
        {
            if (string.IsNullOrWhiteSpace(command.CarTitle))
            {
                return "Car title is required.";
            }

            if (string.IsNullOrWhiteSpace(command.CarBrand))
            {
                return "Car brand is required.";
            }

            if (string.IsNullOrWhiteSpace(command.CarModel))
            {
                return "Car model is required.";
            }

            if (command.CarYear < 1950 || command.CarYear > DateTime.UtcNow.Year + 1)
            {
                return "Invalid car year.";
            }

            if (!command.IsForSale && !command.IsForRent)
            {
                return "Car must be marked for sale or rent.";
            }

            if (command.IsForSale && (!command.SalePrice.HasValue || command.SalePrice.Value <= 0))
            {
                return "Sale price is required when car is for sale.";
            }

            if (command.IsForRent && (!command.RentalDailyPrice.HasValue || command.RentalDailyPrice.Value <= 0))
            {
                return "Rental daily price is required when car is for rent.";
            }

            return null;
        }

        private static readonly Expression<Func<Cars, CarListModel>> ListProjection = car => new CarListModel
        {
            CarsID = car.CarsID,
            TenantID = car.TenantID,
            CarTitle = car.CarTitle,
            CarBrand = car.CarBrand,
            CarModel = car.CarModel,
            CarYear = car.CarYear,
            CarMileage = car.CarMileage,
            CarFuelType = car.CarFuelType,
            CarTransmission = car.CarTransmission,
            CarBodyType = car.CarBodyType,
            CarColor = car.CarColor,
            IsForSale = car.IsForSale,
            SalePrice = car.SalePrice,
            IsForRent = car.IsForRent,
            RentalDailyPrice = car.RentalDailyPrice,
            CarStatus = car.CarStatus,
            CarCreationDate = car.CarCreationDate
        };

        private static readonly Expression<Func<Cars, CarDetailsModel>> DetailsProjection = car => new CarDetailsModel
        {
            CarsID = car.CarsID,
            TenantID = car.TenantID,
            CreatedByAccountID = car.CreatedByAccountID,
            CarTitle = car.CarTitle,
            CarBrand = car.CarBrand,
            CarModel = car.CarModel,
            CarYear = car.CarYear,
            CarMileage = car.CarMileage,
            CarFuelType = car.CarFuelType,
            CarTransmission = car.CarTransmission,
            CarBodyType = car.CarBodyType,
            CarColor = car.CarColor,
            CarDescription = car.CarDescription,
            IsForSale = car.IsForSale,
            SalePrice = car.SalePrice,
            IsForRent = car.IsForRent,
            RentalDailyPrice = car.RentalDailyPrice,
            CarStatus = car.CarStatus,
            CarCreationDate = car.CarCreationDate,
            CarUpdatedDate = car.CarUpdatedDate
        };
    }
}
