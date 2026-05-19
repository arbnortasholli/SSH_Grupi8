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

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _permissionService.GetAllAsync();

            if (!result.IsSuccess)
                return ToActionResult(result);

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _permissionService.GetByIdAsync(id);

            if (!result.IsSuccess)
                return ToActionResult(result);

            return Ok(result);
        }

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

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _permissionService.DeleteAsync(id);

            if (!result.IsSuccess) { 
                return ToActionResult(result);
            }

            return Ok(result);
        }




    } 
}