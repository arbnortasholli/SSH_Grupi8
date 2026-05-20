using AutoKosova.Business.DTOs.AccountsRolePermission;
using AutoKosova.Business.Services;
using Microsoft.AspNetCore.Mvc;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountRolePermissionController : BaseApiController
    {
        private readonly AccountRolePermissionService _accountRolePermissionService;

        public AccountRolePermissionController(AccountRolePermissionService accountRolePermissionService)
        {
            _accountRolePermissionService = accountRolePermissionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _accountRolePermissionService.GetAllAsync();

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _accountRolePermissionService.GetByIdAsync(id);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(AccountRolePermissionCreateRequestDto objDto)
        {
            var result = await _accountRolePermissionService.CreateAsync(objDto);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, AccountRolePermissionUpdateRequestDto objDto)
        {
            var result = await _accountRolePermissionService.UpdateAsync(id, objDto);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _accountRolePermissionService.DeleteAsync(id);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result);
        }
    }
}
