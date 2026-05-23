namespace AutoKosova.Business.DTOs.RentalBookings
{
    public class RentalBookingCreateResponseDto
    {
        public string Message { get; set; } = string.Empty;

        public int RentalBookingID { get; set; }

        public int PaymentOrderID { get; set; }

        public int TotalDays { get; set; }

        public decimal TotalPrice { get; set; }

        public string RentalBookingStatus { get; set; } = string.Empty;

        public string PaymentStatus { get; set; } = string.Empty;

        public string CheckoutUrl { get; set; } = string.Empty;
    }
}
