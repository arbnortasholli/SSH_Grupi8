namespace AutoKosova.Business.DTOs.RentalBookings
{
    public class RentalBookingAdminListResponseDto
    {
        public int RentalBookingID { get; set; }
        public int TenantID { get; set; }
        public string TenantName { get; set; } = string.Empty;
        public int CarID { get; set; }
        public string CarTitle { get; set; } = string.Empty;
        public string CarBrand { get; set; } = string.Empty;
        public string CarModel { get; set; } = string.Empty;
        public int CarYear { get; set; }
        public int CustomerAccountID { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhoneNumber { get; set; } = string.Empty;
        public string CustomerCity { get; set; } = string.Empty;
        public DateTime RentalBookingStartDate { get; set; }
        public DateTime RentalBookingEndDate { get; set; }
        public decimal RentalBookingDailyPrice { get; set; }
        public decimal RentalBookingTotalPrice { get; set; }
        public string RentalBookingStatus { get; set; } = string.Empty;
        public DateTime RentalBookingCreationDate { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
        public decimal? PaymentAmount { get; set; }
        public DateTime? PaymentPaidDate { get; set; }
    }
}
