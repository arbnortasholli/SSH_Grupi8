using AutoKosova.DataAccess;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AutoKosova.Api.Authorization
{
    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        private readonly AppDbContext _context;

        public PermissionAuthorizationHandler(AppDbContext context)
        {
            _context = context;
        }

        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            PermissionRequirement requirement)
        {
            var roleName =
                context.User.FindFirst(ClaimTypes.Role)?.Value ??
                context.User.FindFirst("Role")?.Value;

            if (string.Equals(roleName, "SuperAdmin", StringComparison.OrdinalIgnoreCase))
            {
                context.Succeed(requirement);
                return;
            }

            var roleIdValue = context.User.FindFirst("AccountRoleID")?.Value;

            if (!int.TryParse(roleIdValue, out var accountRoleId))
            {
                return;
            }

            var hasPermission = await _context.AccountRolePermissions
                .AsNoTracking()
                .AnyAsync(item =>
                    item.AccountRoleID == accountRoleId &&
                    item.Permission.PermissionName == requirement.PermissionName &&
                    item.Permission.PersmissionIsActive);

            if (hasPermission)
            {
                context.Succeed(requirement);
            }
        }
    }
}
