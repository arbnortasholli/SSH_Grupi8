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

        [HttpPost("api/cars/{carId:int}/images")]
        public async Task<IActionResult> AddImage(int carId, [FromBody] CarImageCreateRequestDto request)
        {
            var result = await _carImageService.AddImage(
                carId,
                request.CarImageUrl,
                request.CarImageIsMain,
                request.CarImageOrderNumber
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

        [HttpPost("api/cars/{carId:int}/images/upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImage(
            int carId,
            IFormFile image,
            [FromForm] bool carImageIsMain,
            [FromForm] int carImageOrderNumber)
        {
            if (image == null || image.Length == 0)
            {
                return BadRequest("Image file is required.");
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(image.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest("Only JPG, JPEG, PNG and WEBP images are allowed.");
            }

            var uploadsFolder = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                "uploads",
                "cars"
            );

            Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            var imageUrl = $"/uploads/cars/{fileName}";

            var result = await _carImageService.AddImage(
                carId,
                imageUrl,
                carImageIsMain,
                carImageOrderNumber
            );

            if (!result.IsSuccess)
            {
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }

                return ToActionResult(result);
            }

            return Ok(new
            {
                message = "Car image uploaded successfully.",
                carImageID = result.Data!.CarImageID,
                carImageUrl = imageUrl
            });
        }

        [HttpPut("api/car-images/{imageId:int}/set-main")]
        public async Task<IActionResult> SetMainImage(int imageId)
        {
            var result = await _carImageService.SetMainImage(imageId);

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

        [HttpDelete("api/car-images/{imageId:int}")]
        public async Task<IActionResult> DeleteImage(int imageId)
        {
            var result = await _carImageService.DeleteImage(imageId);

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