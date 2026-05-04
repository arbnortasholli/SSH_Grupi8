using System;
using System.Collections.Generic;
using System.Runtime.ConstrainedExecution;
using System.Text;

namespace AutoKosova.Entity
{
    public class Tenant
    {
        public int TenantID { get; set; }

        public required string TenantName { get; set; }

        public string? TenantBusinessNumber { get; set; }

        public string? TenantEmail { get; set; }

        public string? TenantPhoneNumber { get; set; }

        public string? TenantCity { get; set; }

        public string? TenantAddress { get; set; }

        public bool TenantIsActive { get; set; } = true;

        public DateTime TenantCreationDate { get; set; } = DateTime.UtcNow;

        public ICollection<Cars> Cars { get; set; } = new List<Cars>();

        public ICollection<RentalBooking> RentalBookings { get; set; } = new List<RentalBooking>();
    }
}
