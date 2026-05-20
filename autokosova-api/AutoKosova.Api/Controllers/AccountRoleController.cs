using AutoKosova.Api.Authorization;
using AutoKosova.Business.DTOs.AccountRole;
using AutoKosova.Business.Services;
using Microsoft.AspNetCore.Mvc;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountRoleController : BaseApiController
    {
        private readonly AccountRoleService _accountRoleService;

        public AccountRoleController(AccountRoleService accountRoleService)
        {
            _accountRoleService = accountRoleService;
        }

        [HasPermission("AccountRoles.View")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _accountRoleService.GetAllAsync();

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result);
        }

        [HasPermission("AccountRoles.View")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _accountRoleService.GetByIdAsync(id);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result);
        }

        [HasPermission("AccountRoles.Create")]
        [HttpPost]
        public async Task<IActionResult> Create(AccountRoleCreateRequestDto objDto)
        {
            var result = await _accountRoleService.CreateAsync(objDto);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result);
        }

        [HasPermission("AccountRoles.Update")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, AccountRoleUpdateRequestDto objDto)
        {
            var result = await _accountRoleService.UpdateAsync(id, objDto);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result);
        }

        [HasPermission("AccountRoles.Delete")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _accountRoleService.DeleteAsync(id);

            if (!result.IsSuccess)
            {
                return ToActionResult(result);
            }

            return Ok(result);
        }
    }
}
