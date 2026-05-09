using AutoKosova.Api.DTOs.Cars;
using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CarsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CarsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var cars = await _context.Cars
                .Where(c => !c.CarDeleted)
                .OrderByDescending(c => c.CarCreationDate)
                .Select(c => new CarListResponseDto
                {
                    CarsID = c.CarsID,
                    TenantID = c.TenantID,
                    CarTitle = c.CarTitle,
                    CarBrand = c.CarBrand,
                    CarModel = c.CarModel,
                    CarYear = c.CarYear,
                    CarMileage = c.CarMileage,
                    CarFuelType = c.CarFuelType,
                    CarTransmission = c.CarTransmission,
                    CarBodyType = c.CarBodyType,
                    CarColor = c.CarColor,
                    IsForSale = c.IsForSale,
                    SalePrice = c.SalePrice,
                    IsForRent = c.IsForRent,
                    RentalDailyPrice = c.RentalDailyPrice,
                    CarStatus = c.CarStatus,
                    CarCreationDate = c.CarCreationDate
                })
                .ToListAsync();

            return Ok(cars);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var car = await _context.Cars
                .Where(c => c.CarsID == id && !c.CarDeleted)
                .Select(c => new CarDetailsResponseDto
                {
                    CarsID = c.CarsID,
                    TenantID = c.TenantID,
                    CreatedByAccountID = c.CreatedByAccountID,
                    CarTitle = c.CarTitle,
                    CarBrand = c.CarBrand,
                    CarModel = c.CarModel,
                    CarYear = c.CarYear,
                    CarMileage = c.CarMileage,
                    CarFuelType = c.CarFuelType,
                    CarTransmission = c.CarTransmission,
                    CarBodyType = c.CarBodyType,
                    CarColor = c.CarColor,
                    CarDescription = c.CarDescription,
                    IsForSale = c.IsForSale,
                    SalePrice = c.SalePrice,
                    IsForRent = c.IsForRent,
                    RentalDailyPrice = c.RentalDailyPrice,
                    CarStatus = c.CarStatus,
                    CarCreationDate = c.CarCreationDate,
                    CarUpdatedDate = c.CarUpdatedDate
                })
                .FirstOrDefaultAsync();

            if (car == null)
            {
                return NotFound("Car not found.");
            }

            return Ok(car);
        }

        [Authorize(Roles = "Admin,Seller")]
        [HttpPost]
        public async Task<IActionResult> Create(CarCreateRequestDto request)
        {
            var accountId = GetCurrentAccountId();

            if (accountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var validationError = ValidateCarRequest(
                request.CarTitle,
                request.CarBrand,
                request.CarModel,
                request.CarYear,
                request.IsForSale,
                request.SalePrice,
                request.IsForRent,
                request.RentalDailyPrice
            );

            if (validationError != null)
            {
                return BadRequest(validationError);
            }

            if (request.TenantID.HasValue)
            {
                var tenantExists = await _context.Tenants
                    .AnyAsync(t => t.TenantID == request.TenantID.Value);

                if (!tenantExists)
                {
                    return BadRequest("Invalid tenant.");
                }
            }

            var car = new Cars
            {
                TenantID = request.TenantID,
                CreatedByAccountID = accountId.Value,

                CarTitle = request.CarTitle.Trim(),
                CarBrand = request.CarBrand.Trim(),
                CarModel = request.CarModel.Trim(),
                CarYear = request.CarYear,
                CarMileage = request.CarMileage,

                CarFuelType = request.CarFuelType,
                CarTransmission = request.CarTransmission,
                CarBodyType = request.CarBodyType,
                CarColor = request.CarColor,
                CarDescription = request.CarDescription,

                IsForSale = request.IsForSale,
                SalePrice = request.SalePrice,
                IsForRent = request.IsForRent,
                RentalDailyPrice = request.RentalDailyPrice,

                CarStatus = request.CarStatus,
                CarCreationDate = DateTime.UtcNow,
                CarDeleted = false
            };

            _context.Cars.Add(car);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Car created successfully.",
                carID = car.CarsID
            });
        }

        [Authorize(Roles = "Admin,Seller")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, CarUpdateRequestDto request)
        {
            var accountId = GetCurrentAccountId();
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (accountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var car = await _context.Cars
                .FirstOrDefaultAsync(c => c.CarsID == id && !c.CarDeleted);

            if (car == null)
            {
                return NotFound("Car not found.");
            }

            if (role != "Admin" && car.CreatedByAccountID != accountId.Value)
            {
                return Forbid("You can update only cars created by you.");
            }

            var validationError = ValidateCarRequest(
                request.CarTitle,
                request.CarBrand,
                request.CarModel,
                request.CarYear,
                request.IsForSale,
                request.SalePrice,
                request.IsForRent,
                request.RentalDailyPrice
            );

            if (validationError != null)
            {
                return BadRequest(validationError);
            }

            if (request.TenantID.HasValue)
            {
                var tenantExists = await _context.Tenants
                    .AnyAsync(t => t.TenantID == request.TenantID.Value);

                if (!tenantExists)
                {
                    return BadRequest("Invalid tenant.");
                }
            }

            car.TenantID = request.TenantID;
            car.CarTitle = request.CarTitle.Trim();
            car.CarBrand = request.CarBrand.Trim();
            car.CarModel = request.CarModel.Trim();
            car.CarYear = request.CarYear;
            car.CarMileage = request.CarMileage;
            car.CarFuelType = request.CarFuelType;
            car.CarTransmission = request.CarTransmission;
            car.CarBodyType = request.CarBodyType;
            car.CarColor = request.CarColor;
            car.CarDescription = request.CarDescription;
            car.IsForSale = request.IsForSale;
            car.SalePrice = request.SalePrice;
            car.IsForRent = request.IsForRent;
            car.RentalDailyPrice = request.RentalDailyPrice;
            car.CarStatus = request.CarStatus;
            car.CarUpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Car updated successfully.",
                carID = car.CarsID
            });
        }

        [Authorize(Roles = "Admin,Seller")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var accountId = GetCurrentAccountId();
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (accountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var car = await _context.Cars
                .FirstOrDefaultAsync(c => c.CarsID == id && !c.CarDeleted);

            if (car == null)
            {
                return NotFound("Car not found.");
            }

            if (role != "Admin" && car.CreatedByAccountID != accountId.Value)
            {
                return Forbid("You can delete only cars created by you.");
            }

            car.CarDeleted = true;
            car.CarDeletedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Car deleted successfully.",
                carID = car.CarsID
            });
        }

        [HttpGet("for-sale")]
        public async Task<IActionResult> GetForSale()
        {
            var cars = await _context.Cars
                .Where(c => !c.CarDeleted && c.IsForSale)
                .OrderByDescending(c => c.CarCreationDate)
                .Select(c => new CarListResponseDto
                {
                    CarsID = c.CarsID,
                    TenantID = c.TenantID,
                    CarTitle = c.CarTitle,
                    CarBrand = c.CarBrand,
                    CarModel = c.CarModel,
                    CarYear = c.CarYear,
                    CarMileage = c.CarMileage,
                    CarFuelType = c.CarFuelType,
                    CarTransmission = c.CarTransmission,
                    CarBodyType = c.CarBodyType,
                    CarColor = c.CarColor,
                    IsForSale = c.IsForSale,
                    SalePrice = c.SalePrice,
                    IsForRent = c.IsForRent,
                    RentalDailyPrice = c.RentalDailyPrice,
                    CarStatus = c.CarStatus,
                    CarCreationDate = c.CarCreationDate
                })
                .ToListAsync();

            return Ok(cars);
        }

        [HttpGet("for-rent")]
        public async Task<IActionResult> GetForRent()
        {
            var cars = await _context.Cars
                .Where(c => !c.CarDeleted && c.IsForRent)
                .OrderByDescending(c => c.CarCreationDate)
                .Select(c => new CarListResponseDto
                {
                    CarsID = c.CarsID,
                    TenantID = c.TenantID,
                    CarTitle = c.CarTitle,
                    CarBrand = c.CarBrand,
                    CarModel = c.CarModel,
                    CarYear = c.CarYear,
                    CarMileage = c.CarMileage,
                    CarFuelType = c.CarFuelType,
                    CarTransmission = c.CarTransmission,
                    CarBodyType = c.CarBodyType,
                    CarColor = c.CarColor,
                    IsForSale = c.IsForSale,
                    SalePrice = c.SalePrice,
                    IsForRent = c.IsForRent,
                    RentalDailyPrice = c.RentalDailyPrice,
                    CarStatus = c.CarStatus,
                    CarCreationDate = c.CarCreationDate
                })
                .ToListAsync();

            return Ok(cars);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] CarSearchRequestDto request)
        {
            var query = _context.Cars
                .Where(c => !c.CarDeleted)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.Trim().ToLower();

                query = query.Where(c =>
                    c.CarTitle.ToLower().Contains(searchTerm) ||
                    c.CarBrand.ToLower().Contains(searchTerm) ||
                    c.CarModel.ToLower().Contains(searchTerm) ||
                    (c.CarDescription != null && c.CarDescription.ToLower().Contains(searchTerm)));
            }

            if (!string.IsNullOrWhiteSpace(request.Brand))
            {
                var brand = request.Brand.Trim().ToLower();
                query = query.Where(c => c.CarBrand.ToLower() == brand);
            }

            if (!string.IsNullOrWhiteSpace(request.Model))
            {
                var model = request.Model.Trim().ToLower();
                query = query.Where(c => c.CarModel.ToLower() == model);
            }

            if (request.MinYear.HasValue)
            {
                query = query.Where(c => c.CarYear >= request.MinYear.Value);
            }

            if (request.MaxYear.HasValue)
            {
                query = query.Where(c => c.CarYear <= request.MaxYear.Value);
            }

            if (request.MaxMileage.HasValue)
            {
                query = query.Where(c => c.CarMileage <= request.MaxMileage.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.FuelType))
            {
                var fuelType = request.FuelType.Trim().ToLower();
                query = query.Where(c => c.CarFuelType != null && c.CarFuelType.ToLower() == fuelType);
            }

            if (!string.IsNullOrWhiteSpace(request.Transmission))
            {
                var transmission = request.Transmission.Trim().ToLower();
                query = query.Where(c => c.CarTransmission != null && c.CarTransmission.ToLower() == transmission);
            }

            if (!string.IsNullOrWhiteSpace(request.BodyType))
            {
                var bodyType = request.BodyType.Trim().ToLower();
                query = query.Where(c => c.CarBodyType != null && c.CarBodyType.ToLower() == bodyType);
            }

            if (!string.IsNullOrWhiteSpace(request.Color))
            {
                var color = request.Color.Trim().ToLower();
                query = query.Where(c => c.CarColor != null && c.CarColor.ToLower() == color);
            }

            if (request.IsForSale.HasValue)
            {
                query = query.Where(c => c.IsForSale == request.IsForSale.Value);
            }

            if (request.IsForRent.HasValue)
            {
                query = query.Where(c => c.IsForRent == request.IsForRent.Value);
            }

            if (request.MinPrice.HasValue)
            {
                query = query.Where(c =>
                    (c.IsForSale && c.SalePrice >= request.MinPrice.Value) ||
                    (c.IsForRent && c.RentalDailyPrice >= request.MinPrice.Value));
            }

            if (request.MaxPrice.HasValue)
            {
                query = query.Where(c =>
                    (c.IsForSale && c.SalePrice <= request.MaxPrice.Value) ||
                    (c.IsForRent && c.RentalDailyPrice <= request.MaxPrice.Value));
            }

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                var status = request.Status.Trim().ToLower();
                query = query.Where(c => c.CarStatus.ToLower() == status);
            }

            var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
            var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;
            pageSize = pageSize > 50 ? 50 : pageSize;

            var totalRecords = await query.CountAsync();

            var cars = await query
                .OrderByDescending(c => c.CarCreationDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new CarListResponseDto
                {
                    CarsID = c.CarsID,
                    TenantID = c.TenantID,
                    CarTitle = c.CarTitle,
                    CarBrand = c.CarBrand,
                    CarModel = c.CarModel,
                    CarYear = c.CarYear,
                    CarMileage = c.CarMileage,
                    CarFuelType = c.CarFuelType,
                    CarTransmission = c.CarTransmission,
                    CarBodyType = c.CarBodyType,
                    CarColor = c.CarColor,
                    IsForSale = c.IsForSale,
                    SalePrice = c.SalePrice,
                    IsForRent = c.IsForRent,
                    RentalDailyPrice = c.RentalDailyPrice,
                    CarStatus = c.CarStatus,
                    CarCreationDate = c.CarCreationDate
                })
                .ToListAsync();

            return Ok(new
            {
                pageNumber,
                pageSize,
                totalRecords,
                totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize),
                data = cars
            });
        }

        [Authorize(Roles = "Admin,Seller")]
        [HttpGet("my-cars")]
        public async Task<IActionResult> GetMyCars()
        {
            var accountId = GetCurrentAccountId();

            if (accountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var cars = await _context.Cars
                .Where(c => !c.CarDeleted && c.CreatedByAccountID == accountId.Value)
                .OrderByDescending(c => c.CarCreationDate)
                .Select(c => new CarListResponseDto
                {
                    CarsID = c.CarsID,
                    TenantID = c.TenantID,
                    CarTitle = c.CarTitle,
                    CarBrand = c.CarBrand,
                    CarModel = c.CarModel,
                    CarYear = c.CarYear,
                    CarMileage = c.CarMileage,
                    CarFuelType = c.CarFuelType,
                    CarTransmission = c.CarTransmission,
                    CarBodyType = c.CarBodyType,
                    CarColor = c.CarColor,
                    IsForSale = c.IsForSale,
                    SalePrice = c.SalePrice,
                    IsForRent = c.IsForRent,
                    RentalDailyPrice = c.RentalDailyPrice,
                    CarStatus = c.CarStatus,
                    CarCreationDate = c.CarCreationDate
                })
                .ToListAsync();

            return Ok(cars);
        }

        [HttpGet("by-tenant/{tenantId:int}")]
        public async Task<IActionResult> GetByTenant(int tenantId)
        {
            var cars = await _context.Cars
                .Where(c => !c.CarDeleted && c.TenantID == tenantId)
                .OrderByDescending(c => c.CarCreationDate)
                .Select(c => new CarListResponseDto
                {
                    CarsID = c.CarsID,
                    TenantID = c.TenantID,
                    CarTitle = c.CarTitle,
                    CarBrand = c.CarBrand,
                    CarModel = c.CarModel,
                    CarYear = c.CarYear,
                    CarMileage = c.CarMileage,
                    CarFuelType = c.CarFuelType,
                    CarTransmission = c.CarTransmission,
                    CarBodyType = c.CarBodyType,
                    CarColor = c.CarColor,
                    IsForSale = c.IsForSale,
                    SalePrice = c.SalePrice,
                    IsForRent = c.IsForRent,
                    RentalDailyPrice = c.RentalDailyPrice,
                    CarStatus = c.CarStatus,
                    CarCreationDate = c.CarCreationDate
                })
                .ToListAsync();

            return Ok(cars);
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

        private static string? ValidateCarRequest(
            string carTitle,
            string carBrand,
            string carModel,
            int carYear,
            bool isForSale,
            decimal? salePrice,
            bool isForRent,
            decimal? rentalDailyPrice)
        {
            if (string.IsNullOrWhiteSpace(carTitle))
            {
                return "Car title is required.";
            }

            if (string.IsNullOrWhiteSpace(carBrand))
            {
                return "Car brand is required.";
            }

            if (string.IsNullOrWhiteSpace(carModel))
            {
                return "Car model is required.";
            }

            if (carYear < 1950 || carYear > DateTime.UtcNow.Year + 1)
            {
                return "Invalid car year.";
            }

            if (!isForSale && !isForRent)
            {
                return "Car must be marked for sale or rent.";
            }

            if (isForSale && (!salePrice.HasValue || salePrice.Value <= 0))
            {
                return "Sale price is required when car is for sale.";
            }

            if (isForRent && (!rentalDailyPrice.HasValue || rentalDailyPrice.Value <= 0))
            {
                return "Rental daily price is required when car is for rent.";
            }

            return null;
        }
    }
}