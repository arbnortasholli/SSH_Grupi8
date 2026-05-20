using AutoKosova.Api.Authorization;
using AutoKosova.Business.DTOs.Permission;
using AutoKosova.Business.Services;
using Microsoft.AspNetCore.Mvc;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PermissionController : BaseApiController
    {
        private readonly PermissionService _permissionService;

        public PermissionController(PermissionService permissionService)
        {
            _permissionService = permissionService;
        }

        [HasPermission("Permissions.View")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _permissionService.GetAllAsync();

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result);
        }

        [HasPermission("Permissions.View")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _permissionService.GetByIdAsync(id);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result);
        }

        [HasPermission("Permissions.Create")]
        [HttpPost]
        public async Task<IActionResult> Create(PermissionCreateRequestDto dto)
        {
            var result = await _permissionService.CreateAsync(dto);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result.Data);
        }

        [HasPermission("Permissions.Update")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, PermissionUpdateRequestDto objDto)
        {
            var result = await _permissionService.UpdateAsync(id, objDto);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result);
        }

        [HasPermission("Permissions.Delete")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _permissionService.DeleteAsync(id);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result);
        }
    }
}
