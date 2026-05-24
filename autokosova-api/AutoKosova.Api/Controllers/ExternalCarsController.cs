using AutoKosova.Business.DTOs.ExternalCars;
using AutoKosova.Business.Services;
using Microsoft.AspNetCore.Mvc;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    [Route("api/external-cars")]
    public class ExternalCarsController : BaseApiController
    {
        private readonly ExternalCarService _externalCarService;

        public ExternalCarsController(ExternalCarService externalCarService)
        {
            _externalCarService = externalCarService;
        }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] ExternalCarSearchRequestDto request)
        {
            var result = await _externalCarService.Search(request);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            Response.Headers["X-Cache"] = result.Data!.Cached ? "HIT" : "MISS";

            return Ok(result.Data);
        }
    }
}
