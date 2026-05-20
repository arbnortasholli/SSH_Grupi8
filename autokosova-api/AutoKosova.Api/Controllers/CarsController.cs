using AutoKosova.Api.DTOs.Cars;
using AutoKosova.Business.Services;
using AutoKosova.Entity;
using Microsoft.AspNetCore.Mvc;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CarsController : BaseApiController
    {
        private readonly CarService _carService;

        public CarsController(CarService carService)
        {
            _carService = carService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var cars = await _carService.GetAll();

            return Ok(cars.Select(ToListDto));
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _carService.GetById(id);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(ToDetailsDto(result.Data!));
        }

        [HttpPost]
        public async Task<IActionResult> Create(CarCreateRequestDto request)
        {
            var result = await _carService.Create(ToCar(request));

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(new
            {
                message = "Car created successfully.",
                carID = result.Data!.CarsID
            });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, CarUpdateRequestDto request)
        {
            var result = await _carService.Update(id, ToCar(request));

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(new
            {
                message = "Car updated successfully.",
                carID = result.Data!.CarsID
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _carService.Delete(id);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(new
            {
                message = "Car deleted successfully.",
                carID = result.Data!.CarsID
            });
        }

        [HttpGet("for-sale")]
        public async Task<IActionResult> GetForSale()
        {
            var cars = await _carService.GetForSale();

            return Ok(cars.Select(ToListDto));
        }

        [HttpGet("for-rent")]
        public async Task<IActionResult> GetForRent()
        {
            var cars = await _carService.GetForRent();

            return Ok(cars.Select(ToListDto));
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] CarSearchRequestDto request)
        {
            var result = await _carService.Search(
                request.SearchTerm,
                request.Brand,
                request.Model,
                request.MinYear,
                request.MaxYear,
                request.MaxMileage,
                request.FuelType,
                request.Transmission,
                request.BodyType,
                request.Color,
                request.IsForSale,
                request.IsForRent,
                request.MinPrice,
                request.MaxPrice,
                request.Status,
                request.PageNumber,
                request.PageSize);

            return Ok(new
            {
                pageNumber = result.PageNumber,
                pageSize = result.PageSize,
                totalRecords = result.TotalRecords,
                totalPages = result.TotalPages,
                data = result.Data.Select(ToListDto)
            });
        }

        [HttpGet("my-cars")]
        public async Task<IActionResult> GetMyCars([FromQuery] int accountId)
        {
            if (accountId <= 0)
            {
                return BadRequest("accountId is required.");
            }

            var cars = await _carService.GetMyCars(accountId);

            return Ok(cars.Select(ToListDto));
        }

        [HttpGet("by-tenant/{tenantId:int}")]
        public async Task<IActionResult> GetByTenant(int tenantId)
        {
            var cars = await _carService.GetByTenant(tenantId);

            return Ok(cars.Select(ToListDto));
        }

        private static Cars ToCar(CarCreateRequestDto request)
        {
            return new Cars
            {
                TenantID = request.TenantID,
                CreatedByAccountID = request.CreatedByAccountID,
                CarTitle = request.CarTitle,
                CarBrand = request.CarBrand,
                CarModel = request.CarModel,
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
                CarStatus = request.CarStatus
            };
        }

        private static Cars ToCar(CarUpdateRequestDto request)
        {
            return new Cars
            {
                TenantID = request.TenantID,
                CarTitle = request.CarTitle,
                CarBrand = request.CarBrand,
                CarModel = request.CarModel,
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
                CarStatus = request.CarStatus
            };
        }

        private static CarListResponseDto ToListDto(Cars car)
        {
            return new CarListResponseDto
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
        }

        private static CarDetailsResponseDto ToDetailsDto(Cars car)
        {
            return new CarDetailsResponseDto
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
}
