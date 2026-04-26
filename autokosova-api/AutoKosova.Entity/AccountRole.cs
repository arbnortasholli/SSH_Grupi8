using System;
using System.Collections.Generic;
using System.Text;

namespace AutoKosova.Entity
{
    public class AccountRole
    {
        public int AccountRoleID { get; set; }
        public required string AccountRoleName { get; set; }
        public string? AccountRoleDescription { get; set; }
    }
}
