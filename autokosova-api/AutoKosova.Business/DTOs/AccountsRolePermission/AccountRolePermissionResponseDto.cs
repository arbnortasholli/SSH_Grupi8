using System;
using System.Collections.Generic;
using System.Text;

namespace AutoKosova.Business.DTOs.AccountsRolePermission
{
    public class AccountRolePermissionResponseDto
    {
        public int AccountRolePermissionID { get; set; }

        public int AccountRoleID { get; set; }
        public string AccountRoleName { get; set; } = string.Empty;

        public int PermissionID { get; set; }
        public string PermissionName { get; set; } = string.Empty;
        public string? PermissionDescription { get; set; }
        public string? PermissionGroup { get; set; }

        public DateTime AccountRolePermissionCreatedAt { get; set; }
    }
}
