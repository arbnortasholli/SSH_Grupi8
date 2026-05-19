using System;
using System.Collections.Generic;
using System.Text;

namespace AutoKosova.Business.DTOs.AccountRole
{
    public class AccountRoleCreateRequestDto
    {
        public required string AccountRoleName { get; set; }
        public string? AccountRoleDescription { get; set; }
    }
}
