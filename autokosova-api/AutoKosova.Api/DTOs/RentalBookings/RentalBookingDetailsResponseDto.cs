namespace AutoKosova.Api.DTOs.RentalBookings
{
    public class RentalBookingDetailsResponseDto
    {
        public int RentalBookingID { get; set; }

        public int TenantID { get; set; }

        public int CarID { get; set; }

        public int CustomerAccountID { get; set; }

        public string CustomerUsername { get; set; } = string.Empty;

        public string CustomerEmail { get; set; } = string.Empty;

        public string CarTitle { get; set; } = string.Empty;

        public string CarBrand { get; set; } = string.Empty;

        public string CarModel { get; set; } = string.Empty;

        public DateTime RentalBookingStartDate { get; set; }

        public DateTime RentalBookingEndDate { get; set; }

        public decimal RentalBookingDailyPrice { get; set; }

        public decimal RentalBookingTotalPrice { get; set; }

        public string RentalBookingStatus { get; set; } = string.Empty;

        public DateTime RentalBookingCreationDate { get; set; }

        public DateTime? RentalBookingUpdatedDate { get; set; }
    }
}