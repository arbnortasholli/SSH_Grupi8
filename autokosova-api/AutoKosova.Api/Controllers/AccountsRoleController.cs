using AutoKosova.DataAccess;
using AutoKosova.Entity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoKosova.Api.Controllers
{
    public class AccountsRoleController(AppDbContext context) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<List<AccountRole>>> GetRoles()
        {
            return await context.AccountsRole.ToListAsync();
        }

        [HttpGet("id")]
        public async Task<ActionResult<AccountRole>> GetRoleDetails(int id)
        {
            var role =  await context.AccountsRole.FindAsync(id);

            if (role == null) return NotFound();

            return Ok(role);
        }

        
    }
}
