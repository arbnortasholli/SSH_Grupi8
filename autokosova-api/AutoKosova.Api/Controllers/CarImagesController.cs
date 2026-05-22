using AutoKosova.Api.Authorization;
using AutoKosova.Business.DTOs.CarImages;
using AutoKosova.Business.Services;
using AutoKosova.Entity;
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

        [HasPermission("Cars.Images.Manage")]
        [HttpPost("api/cars/{carId:int}/images")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImages(int carId, [FromForm] CarImageUploadRequestDto request)
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _carImageService.UploadImages(carId, request.Images, CurrentAccountId.Value, CurrentRole, request.MainImageIndex);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(new CarImageUploadResponseDto
            {
                CarID = carId,
                Images = result.Data!.Select(ToDto).ToList()
            });
        }

        [HasPermission("Cars.Images.Manage")]
        [HttpPost("api/cars/{carId:int}/images/url")]
        public async Task<IActionResult> AddImageUrl(int carId, [FromBody] CarImageCreateRequestDto request)
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
                message = "Car image URL added successfully.",
                carImageID = result.Data!.CarImageID,
                carImageUrl = result.Data.CarImageUrl
            });
        }

        [HasPermission("Cars.Images.Manage")]
        [HttpPost("api/cars/{carId:int}/images/upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImage(int carId, [FromForm] CarImageUploadRequestDto request)
        {
            return await UploadImages(carId, request);
        }

        [HasPermission("Cars.Images.Manage")]
        [HttpPut("api/cars/{carId:int}/images/{imageId:int}/set-main")]
        public async Task<IActionResult> SetMainImage(int carId, int imageId)
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

        [HasPermission("Cars.Images.Manage")]
        [HttpPut("api/cars/{carId:int}/images/reorder")]
        public async Task<IActionResult> ReorderImages(int carId, [FromBody] CarImageReorderRequestDto request)
        {
            var imageOrders = request.Images.ToDictionary(
                image => image.CarImageID,
                image => image.CarImageOrderNumber);

            var result = await _carImageService.ReorderImages(carId, imageOrders);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result.Data!.Select(ToDto));
        }

        [HasPermission("Cars.Images.Manage")]
        [HttpDelete("api/cars/{carId:int}/images/{imageId:int}")]
        public async Task<IActionResult> DeleteImage(int carId, int imageId, [FromQuery] bool deleteLocalFile = true)
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

        [HasPermission("Cars.Images.Manage")]
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

        [HasPermission("Cars.Images.Manage")]
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
                CarImageOriginalFileName = image.CarImageOriginalFileName,
                CarImageContentType = image.CarImageContentType,
                CarImageSizeBytes = image.CarImageSizeBytes,
                CarImageIsMain = image.CarImageIsMain,
                CarImageOrderNumber = image.CarImageOrderNumber,
                CarImageCreationDate = image.CarImageCreationDate
            };
        }
    }
}
