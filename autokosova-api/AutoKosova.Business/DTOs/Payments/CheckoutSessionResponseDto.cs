namespace AutoKosova.Business.DTOs.Payments
{
    public class CheckoutSessionResponseDto
    {
        public int PaymentOrderID { get; set; }

        public int RentalBookingID { get; set; }

        public string CheckoutUrl { get; set; } = string.Empty;

        public string StripeCheckoutSessionID { get; set; } = string.Empty;
    }
}
