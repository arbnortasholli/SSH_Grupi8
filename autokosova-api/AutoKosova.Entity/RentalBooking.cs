using System;
using System.Collections.Generic;
using System.Runtime.ConstrainedExecution;
using System.Text;

namespace AutoKosova.Entity
{
    public class RentalBooking
    {
        public int RentalBookingID { get; set; }

        public int TenantID { get; set; }
        public int CarID { get; set; }

        public int CustomerAccountID { get; set; }

        public DateTime RentalBookingStartDate { get; set; }

        public DateTime RentalBookingEndDate { get; set; }

        public decimal RentalBookingDailyPrice { get; set; }

        public decimal RentalBookingTotalPrice { get; set; }

        public string RentalBookingStatus { get; set; } = "Pending";

        public DateTime RentalBookingCreationDate { get; set; } = DateTime.UtcNow;

        public DateTime? RentalBookingUpdatedDate { get; set; }

        public bool RentalBookingDeleted { get; set; }

        public DateTime? RentalBookingDeletedDate { get; set; }

        public required Tenant Tenant { get; set; }

        public required Cars Car { get; set; }

        public required Account CustomerAccount { get; set; }
    }
}
