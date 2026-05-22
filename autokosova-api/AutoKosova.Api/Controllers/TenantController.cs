using AutoKosova.Api.Authorization;
using AutoKosova.Business.DTOs.Tenants;
using AutoKosova.Business.Services;
using Microsoft.AspNetCore.Mvc;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TenantController : BaseApiController
    {
        private readonly TenantService _tenantService;

        public TenantController(TenantService tenantService)
        {
            _tenantService = tenantService;
        }

        [HasPermission("Tenants.View")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _tenantService.GetAllAsync();
            return ToActionResult(result);
        }

        [HasPermission("Tenants.View")]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _tenantService.GetByIdAsync(id);
            return ToActionResult(result);
        }

        [HasPermission("Tenants.Create")]
        [HttpPost]
        public async Task<IActionResult> Create(TenantCreateRequestDto request)
        {
            var result = await _tenantService.CreateAsync(request);
            return ToActionResult(result);
        }

        [HasPermission("Tenants.Update")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, TenantUpdateRequestDto request)
        {
            var result = await _tenantService.UpdateAsync(id, request);
            return ToActionResult(result);
        }

        [HasPermission("Tenants.Delete")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _tenantService.DeleteAsync(id);
            return ToActionResult(result);
        }
    }
}
