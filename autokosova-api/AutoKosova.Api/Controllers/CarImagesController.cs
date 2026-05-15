using AutoKosova.Api.DTOs.CarImages;
using AutoKosova.Business.Services;
using AutoKosova.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    public class CarImagesController : BaseApiController
    {
        private readonly CarImageService _carImageService;

        public CarImagesController(CarImageService carImageService)
        {
            _carImageService = carImageService;
        }

        [HttpGet("api/cars/{carId:int}/images")]
        public async Task<IActionResult> GetImagesByCarId(int carId)
        {
            var result = await _carImageService.GetImagesByCarId(carId);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result.Data!.Select(ToDto));
        }

        [HttpGet("api/car-images/{imageId:int}")]
        public async Task<IActionResult> GetImageById(int imageId)
        {
            var result = await _carImageService.GetImageById(imageId);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(ToDto(result.Data!));
        }

        [Authorize(Roles = "Admin,Seller")]
        [HttpPost("api/cars/{carId:int}/images")]
        public async Task<IActionResult> AddImage(int carId, CarImageCreateRequestDto request)
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _carImageService.AddImage(
                carId,
                request.CarImageUrl,
                request.CarImageIsMain,
                request.CarImageOrderNumber,
                CurrentAccountId.Value,
                CurrentRole
            );

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(new
            {
                message = "Car image added successfully.",
                carImageID = result.Data!.CarImageID
            });
        }

        [Authorize(Roles = "Admin,Seller")]
        [HttpPut("api/car-images/{imageId:int}/set-main")]
        public async Task<IActionResult> SetMainImage(int imageId)
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _carImageService.SetMainImage(imageId, CurrentAccountId.Value, CurrentRole);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(new
            {
                message = "Main image updated successfully.",
                carImageID = result.Data!.CarImageID
            });
        }

        [Authorize(Roles = "Admin,Seller")]
        [HttpDelete("api/car-images/{imageId:int}")]
        public async Task<IActionResult> DeleteImage(int imageId)
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _carImageService.DeleteImage(imageId, CurrentAccountId.Value, CurrentRole);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(new
            {
                message = "Car image deleted successfully.",
                carImageID = result.Data!.CarImageID
            });
        }

        private static CarImageResponseDto ToDto(CarImage image)
        {
            return new CarImageResponseDto
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
}
