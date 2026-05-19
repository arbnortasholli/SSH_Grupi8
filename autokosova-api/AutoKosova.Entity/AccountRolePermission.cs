using System;
using System.Collections.Generic;
using System.Text;

namespace AutoKosova.Entity
{
    public class AccountRolePermission
    {
        public int AccountRolePermissionID { get; set; }

        public int AccountRoleID { get; set; }
        public AccountRole AccountRole { get; set; } = null!;

        public int PermissionID { get; set; }
        public Permission Permission { get; set; } = null!;

        public DateTime AccountRolePermissionCreatedAt { get; set; } = DateTime.UtcNow;
    }
}
