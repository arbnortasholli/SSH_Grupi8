using System;
using System.Collections.Generic;
using System.Text;

namespace AutoKosova.Business.DTOs.Permission
{
    public class PermissionCreateRequestDto
    {
        public string PermissionName { get; set; } = string.Empty;
        public string? PermissionDescription { get; set; }
        public string? PermissionGroup { get; set; }
        public bool PersmissionIsActive { get; set; } = true;
    }
}
