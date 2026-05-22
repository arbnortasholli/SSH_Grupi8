namespace AutoKosova.Business.DTOs.Payments
{
    public class PaymentStatusResponseDto
    {
        public int PaymentOrderID { get; set; }

        public int RentalBookingID { get; set; }

        public decimal Amount { get; set; }

        public string Currency { get; set; } = string.Empty;

        public string PaymentStatus { get; set; } = string.Empty;

        public string PaymentProvider { get; set; } = string.Empty;

        public string? StripeCheckoutSessionID { get; set; }

        public string? StripePaymentIntentID { get; set; }

        public string RentalBookingStatus { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; }

        public DateTime? PaidDate { get; set; }

        public DateTime? FailedDate { get; set; }

        public DateTime? CancelledDate { get; set; }
    }
}
