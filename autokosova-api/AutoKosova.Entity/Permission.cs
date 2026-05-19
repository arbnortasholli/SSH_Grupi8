using System;
using System.Collections.Generic;
using System.Text;

namespace AutoKosova.Entity
{
    public class Permission
    {
        public int PermissionID { get; set; }

        public string PermissionName { get; set; } = null!;

        public string? PermissionDescription { get; set; }

        public string? PermissionGroup { get; set; }

        public bool PersmissionIsActive { get; set; } = true;
    }
}
