namespace AutoKosova.Business.Models
{
    public class RentalBookingCreateCommand
    {
        public int CarID { get; set; }
        public DateTime RentalBookingStartDate { get; set; }
        public DateTime RentalBookingEndDate { get; set; }
    }

    public class RentalBookingCreatedModel
    {
        public int RentalBookingID { get; set; }
        public int TotalDays { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class RentalBookingListModel
    {
        public int RentalBookingID { get; set; }
        public int TenantID { get; set; }
        public int CarID { get; set; }
        public int CustomerAccountID { get; set; }
        public string CarTitle { get; set; } = string.Empty;
        public string CarBrand { get; set; } = string.Empty;
        public string CarModel { get; set; } = string.Empty;
        public DateTime RentalBookingStartDate { get; set; }
        public DateTime RentalBookingEndDate { get; set; }
        public decimal RentalBookingDailyPrice { get; set; }
        public decimal RentalBookingTotalPrice { get; set; }
        public string RentalBookingStatus { get; set; } = string.Empty;
        public DateTime RentalBookingCreationDate { get; set; }
    }

    public class RentalBookingDetailsModel : RentalBookingListModel
    {
        public string CustomerUsername { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public DateTime? RentalBookingUpdatedDate { get; set; }
    }

    public class CarAvailabilityModel
    {
        public int CarID { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsAvailable { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class RentalBookingStatusModel
    {
        public int RentalBookingID { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
