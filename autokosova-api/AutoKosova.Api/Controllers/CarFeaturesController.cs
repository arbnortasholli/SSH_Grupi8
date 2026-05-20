using AutoKosova.Api.DTOs.CarFeatures;
using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    public class CarFeaturesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CarFeaturesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("api/car-features")]
        public async Task<IActionResult> GetAll()
        {
            var features = await _context.CarFeatures
                .Where(cf => cf.CarFeatureIsActive && !cf.CarFeatureDeleted)
                .OrderBy(cf => cf.CarFeatureOrderNumber)
                .Select(cf => new CarFeatureResponseDto
                {
                    CarFeatureID = cf.CarFeatureID,
                    CarFeatureName = cf.CarFeatureName,
                    CarFeatureDescription = cf.CarFeatureDescription,
                    CarFeatureIsActive = cf.CarFeatureIsActive,
                    CarFeatureOrderNumber = cf.CarFeatureOrderNumber,
                    CarFeatureCreationDate = cf.CarFeatureCreationDate
                })
                .ToListAsync();

            return Ok(features);
        }

        [HttpGet("api/car-features/{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var feature = await _context.CarFeatures
                .Where(cf => cf.CarFeatureID == id && !cf.CarFeatureDeleted)
                .Select(cf => new CarFeatureResponseDto
                {
                    CarFeatureID = cf.CarFeatureID,
                    CarFeatureName = cf.CarFeatureName,
                    CarFeatureDescription = cf.CarFeatureDescription,
                    CarFeatureIsActive = cf.CarFeatureIsActive,
                    CarFeatureOrderNumber = cf.CarFeatureOrderNumber,
                    CarFeatureCreationDate = cf.CarFeatureCreationDate
                })
                .FirstOrDefaultAsync();

            if (feature == null)
            {
                return NotFound("Car feature not found.");
            }

            return Ok(feature);
        }

        [HttpPost("api/car-features")]
        public async Task<IActionResult> Create(CarFeatureCreateRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.CarFeatureName))
            {
                return BadRequest("Car feature name is required.");
            }

            var featureName = request.CarFeatureName.Trim();
            var featureNameLower = featureName.ToLower();

            var duplicateExists = await _context.CarFeatures
                .AnyAsync(cf =>
                    !cf.CarFeatureDeleted &&
                    cf.CarFeatureName.ToLower() == featureNameLower);

            if (duplicateExists)
            {
                return BadRequest("Car feature name already exists.");
            }

            var feature = new CarFeature
            {
                CarFeatureName = featureName,
                CarFeatureDescription = request.CarFeatureDescription,
                CarFeatureIsActive = request.CarFeatureIsActive,
                CarFeatureOrderNumber = request.CarFeatureOrderNumber,
                CarFeatureCreationDate = DateTime.UtcNow,
                CarFeatureDeleted = false
            };

            _context.CarFeatures.Add(feature);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Car feature created successfully.",
                carFeatureID = feature.CarFeatureID
            });
        }

        [HttpPut("api/car-features/{id:int}")]
        public async Task<IActionResult> Update(int id, CarFeatureUpdateRequestDto request)
        {
            var feature = await _context.CarFeatures
                .FirstOrDefaultAsync(cf => cf.CarFeatureID == id && !cf.CarFeatureDeleted);

            if (feature == null)
            {
                return NotFound("Car feature not found.");
            }

            if (string.IsNullOrWhiteSpace(request.CarFeatureName))
            {
                return BadRequest("Car feature name is required.");
            }

            var featureName = request.CarFeatureName.Trim();
            var featureNameLower = featureName.ToLower();

            var duplicateExists = await _context.CarFeatures
                .AnyAsync(cf =>
                    cf.CarFeatureID != id &&
                    !cf.CarFeatureDeleted &&
                    cf.CarFeatureName.ToLower() == featureNameLower);

            if (duplicateExists)
            {
                return BadRequest("Car feature name already exists.");
            }

            feature.CarFeatureName = featureName;
            feature.CarFeatureDescription = request.CarFeatureDescription;
            feature.CarFeatureIsActive = request.CarFeatureIsActive;
            feature.CarFeatureOrderNumber = request.CarFeatureOrderNumber;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Car feature updated successfully.",
                carFeatureID = feature.CarFeatureID
            });
        }

        [HttpDelete("api/car-features/{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var feature = await _context.CarFeatures
                .FirstOrDefaultAsync(cf => cf.CarFeatureID == id && !cf.CarFeatureDeleted);

            if (feature == null)
            {
                return NotFound("Car feature not found.");
            }

            feature.CarFeatureDeleted = true;
            feature.CarFeatureDeletedDate = DateTime.UtcNow;

            var mappings = await _context.CarFeatureMappings
                .Where(cfm => cfm.CarFeatureID == id && !cfm.CarFeatureMappingDeleted)
                .ToListAsync();

            foreach (var mapping in mappings)
            {
                mapping.CarFeatureMappingDeleted = true;
                mapping.CarFeatureMappingDeletedDate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Car feature deleted successfully.",
                carFeatureID = feature.CarFeatureID
            });
        }

        [HttpGet("api/cars/{carId:int}/features")]
        public async Task<IActionResult> GetCarFeatures(int carId)
        {
            var carExists = await _context.Cars
                .AnyAsync(c => c.CarsID == carId && !c.CarDeleted);

            if (!carExists)
            {
                return NotFound("Car not found.");
            }

            var features = await _context.CarFeatureMappings
                .Include(cfm => cfm.CarFeature)
                .Where(cfm =>
                    cfm.CarID == carId &&
                    !cfm.CarFeatureMappingDeleted &&
                    cfm.CarFeature != null &&
                    cfm.CarFeature.CarFeatureIsActive &&
                    !cfm.CarFeature.CarFeatureDeleted)
                .OrderBy(cfm => cfm.CarFeature != null ? cfm.CarFeature.CarFeatureOrderNumber : 0)
                .Select(cfm => new CarFeatureMappingResponseDto
                {
                    CarFeatureMappingID = cfm.CarFeatureMappingID,
                    CarID = cfm.CarID,
                    CarFeatureID = cfm.CarFeatureID,
                    CarFeatureName = cfm.CarFeature != null ? cfm.CarFeature.CarFeatureName : string.Empty,
                    CarFeatureDescription = cfm.CarFeature != null ? cfm.CarFeature.CarFeatureDescription : null,
                    CarFeatureOrderNumber = cfm.CarFeature != null ? cfm.CarFeature.CarFeatureOrderNumber : 0,
                    CarFeatureMappingCreationDate = cfm.CarFeatureMappingCreationDate
                })
                .ToListAsync();

            return Ok(features);
        }

        [HttpPost("api/cars/{carId:int}/features/{featureId:int}")]
        public async Task<IActionResult> AssignFeatureToCar(int carId, int featureId)
        {
            var car = await _context.Cars
                .FirstOrDefaultAsync(c => c.CarsID == carId && !c.CarDeleted);

            if (car == null)
            {
                return NotFound("Car not found.");
            }

            var feature = await _context.CarFeatures
                .FirstOrDefaultAsync(cf =>
                    cf.CarFeatureID == featureId &&
                    cf.CarFeatureIsActive &&
                    !cf.CarFeatureDeleted);

            if (feature == null)
            {
                return NotFound("Car feature not found.");
            }

            var existingMapping = await _context.CarFeatureMappings
                .FirstOrDefaultAsync(cfm =>
                    cfm.CarID == carId &&
                    cfm.CarFeatureID == featureId);

            if (existingMapping != null)
            {
                if (!existingMapping.CarFeatureMappingDeleted)
                {
                    return BadRequest("Car feature is already assigned to this car.");
                }

                existingMapping.CarFeatureMappingDeleted = false;
                existingMapping.CarFeatureMappingDeletedDate = null;
                existingMapping.CarFeatureMappingCreationDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Car feature assigned successfully.",
                    carFeatureMappingID = existingMapping.CarFeatureMappingID
                });
            }

            var mapping = new CarFeatureMapping
            {
                CarID = carId,
                CarFeatureID = featureId,
                CarFeatureMappingCreationDate = DateTime.UtcNow,
                CarFeatureMappingDeleted = false
            };

            _context.CarFeatureMappings.Add(mapping);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Car feature assigned successfully.",
                carFeatureMappingID = mapping.CarFeatureMappingID
            });
        }

        [HttpDelete("api/cars/{carId:int}/features/{featureId:int}")]
        public async Task<IActionResult> RemoveFeatureFromCar(int carId, int featureId)
        {
            var car = await _context.Cars
                .FirstOrDefaultAsync(c => c.CarsID == carId && !c.CarDeleted);

            if (car == null)
            {
                return NotFound("Car not found.");
            }

            var mapping = await _context.CarFeatureMappings
                .FirstOrDefaultAsync(cfm =>
                    cfm.CarID == carId &&
                    cfm.CarFeatureID == featureId &&
                    !cfm.CarFeatureMappingDeleted);

            if (mapping == null)
            {
                return NotFound("Car feature mapping not found.");
            }

            mapping.CarFeatureMappingDeleted = true;
            mapping.CarFeatureMappingDeletedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Car feature removed successfully.",
                carID = carId,
                carFeatureID = featureId
            });
        }

    }
}
