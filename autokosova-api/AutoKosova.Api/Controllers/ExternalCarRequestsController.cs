using AutoKosova.Business.DTOs.ExternalCarRequests;
using AutoKosova.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    [Route("api/external-car-requests")]
    public class ExternalCarRequestsController : BaseApiController
    {
        private readonly ExternalCarRequestService _externalCarRequestService;

        public ExternalCarRequestsController(ExternalCarRequestService externalCarRequestService)
        {
            _externalCarRequestService = externalCarRequestService;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create(ExternalCarRequestCreateDto request)
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _externalCarRequestService.CreateAsync(CurrentAccountId.Value, request);
            return ToActionResult(result);
        }

        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyRequests()
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _externalCarRequestService.GetMyRequestsAsync(CurrentAccountId.Value);
            return ToActionResult(result);
        }

        [Authorize]
        [HttpPut("my/{id:int}/decision")]
        public async Task<IActionResult> UpdateMyDecision(int id, ExternalCarRequestDecisionDto request)
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _externalCarRequestService.UpdateCustomerDecisionAsync(id, CurrentAccountId.Value, request);
            return ToActionResult(result);
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _externalCarRequestService.GetAllAsync();
            return ToActionResult(result);
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _externalCarRequestService.GetByIdAsync(id);
            return ToActionResult(result);
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(int id, ExternalCarRequestStatusUpdateDto request)
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _externalCarRequestService.UpdateStatusAsync(id, CurrentAccountId.Value, request);
            return ToActionResult(result);
        }
    }
}
