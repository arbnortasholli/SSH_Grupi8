using AutoKosova.Api.Authorization;
using AutoKosova.Business.DTOs.TenantRequests;
using AutoKosova.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    [Route("api/tenant-requests")]
    public class TenantRequestsController : BaseApiController
    {
        private readonly TenantRequestService _tenantRequestService;

        public TenantRequestsController(TenantRequestService tenantRequestService)
        {
            _tenantRequestService = tenantRequestService;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create(TenantRequestCreateDto request)
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _tenantRequestService.CreateAsync(CurrentAccountId.Value, request);
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

            var result = await _tenantRequestService.GetMyRequestsAsync(CurrentAccountId.Value);
            return ToActionResult(result);
        }

        [HasPermission("TenantRequests.View")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _tenantRequestService.GetAllAsync();
            return ToActionResult(result);
        }

        [HasPermission("TenantRequests.View")]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _tenantRequestService.GetByIdAsync(id);
            return ToActionResult(result);
        }

        [HasPermission("TenantRequests.Review")]
        [HttpPut("{id:int}/review")]
        public async Task<IActionResult> Review(int id, TenantRequestReviewDto request)
        {
            if (CurrentAccountId == null)
            {
                return Unauthorized("Invalid token.");
            }

            var result = await _tenantRequestService.ReviewAsync(id, CurrentAccountId.Value, request);
            return ToActionResult(result);
        }
    }
}
