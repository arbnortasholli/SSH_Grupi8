using System;
using System.Collections.Generic;
using System.Text;

namespace AutoKosova.Business.DTOs.AccountsRolePermission
{
    public class AccountRolePermissionCreateRequestDto
    {
        public int AccountRoleID { get; set; }
        public int PermissionID { get; set; }
    }
}
