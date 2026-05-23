namespace AutoKosova.Entity
{
    public class PaymentOrder
    {
        public int PaymentOrderID { get; set; }

        public int AccountID { get; set; }

        public int RentalBookingID { get; set; }

        public decimal Amount { get; set; }

        public required string Currency { get; set; } = "eur";

        public int PaymentStatusID { get; set; }

        public required string PaymentProvider { get; set; } = "Stripe";

        public string? StripeCheckoutSessionID { get; set; }

        public string? StripePaymentIntentID { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? PaidDate { get; set; }

        public DateTime? FailedDate { get; set; }

        public DateTime? CancelledDate { get; set; }

        public Account? Account { get; set; }

        public RentalBooking? RentalBooking { get; set; }

        public PaymentStatus? PaymentStatus { get; set; }
    }
}
