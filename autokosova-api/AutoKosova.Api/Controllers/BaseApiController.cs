using AutoKosova.Business.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AutoKosova.Api.Controllers
{
    public class BaseApiController : ControllerBase
    {
        protected int? CurrentAccountId
        {
            get
            {
                var accountIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

                return int.TryParse(accountIdValue, out var accountId)
                    ? accountId
                    : null;
            }
        }

        protected string? CurrentRole => User.FindFirstValue(ClaimTypes.Role);

        protected IActionResult ToActionResult<T>(ServiceResult<T> result)
        {
            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }

            return result.Status switch
            {
                ServiceStatus.BadRequest => BadRequest(result.Error),
                ServiceStatus.Unauthorized => Unauthorized(result.Error),
                ServiceStatus.Forbidden => StatusCode(StatusCodes.Status403Forbidden, result.Error),
                ServiceStatus.NotFound => NotFound(result.Error),
                _ => BadRequest(result.Error)
            };
        }
    }
}
