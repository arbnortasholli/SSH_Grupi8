using Microsoft.AspNetCore.Authorization;

namespace AutoKosova.Api.Authorization
{
    public class HasPermissionAttribute : AuthorizeAttribute
    {
        public const string PolicyPrefix = "Permission:";

        public HasPermissionAttribute(string permissionName)
        {
            Policy = $"{PolicyPrefix}{permissionName}";
        }
    }
}
