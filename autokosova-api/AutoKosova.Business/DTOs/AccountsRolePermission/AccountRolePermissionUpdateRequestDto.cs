using System;
using System.Collections.Generic;
using System.Text;

namespace AutoKosova.Business.DTOs.AccountsRolePermission
{
    public class AccountRolePermissionUpdateRequestDto
    {
        public int AccountRoleID { get; set; }
        public int PermissionID { get; set; }
    }
}
