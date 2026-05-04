using System;
using System.Collections.Generic;
using System.Text;

namespace AutoKosova.Entity
{
    public class Cars
    {
        public int CarsID { get; set; }

        public int? TenantID { get; set; }
        public int CreatedByAccountID { get; set; }

        public required string CarTitle { get; set; }

        public required string CarBrand { get; set; }

        public required string CarModel { get; set; }

        public int CarYear { get; set; }

        public int CarMileage { get; set; }

        public string? CarFuelType { get; set; }

        public string? CarTransmission { get; set; }

        public string? CarBodyType { get; set; }

        public string? CarColor { get; set; }

        public string? CarDescription { get; set; }

        // Për shitje
        public bool IsForSale { get; set; }

        public decimal? SalePrice { get; set; }

        // Për rent
        public bool IsForRent { get; set; }

        public decimal? RentalDailyPrice { get; set; }

        // Available, Reserved, Sold, Rented, Inactive
        public required string CarStatus { get; set; } = "Available";

        public DateTime CarCreationDate { get; set; } = DateTime.UtcNow;

        public DateTime? CarUpdatedDate { get; set; }

        public bool CarDeleted { get; set; }

        public DateTime? CarDeletedDate { get; set; }

        // Navigation properties
        public Tenant? Tenant { get; set; }

        public required Account CreatedByAccount { get; set; }

        public ICollection<CarImage> CarImages { get; set; } = new List<CarImage>();

        public ICollection<RentalBooking> RentalBookings { get; set; } = new List<RentalBooking>();
    }
}
