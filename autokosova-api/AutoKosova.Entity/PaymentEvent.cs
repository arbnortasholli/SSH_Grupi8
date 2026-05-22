namespace AutoKosova.Entity
{
    public class PaymentEvent
    {
        public int PaymentEventID { get; set; }

        public required string StripeEventID { get; set; }

        public required string EventType { get; set; }

        public string? StripeCheckoutSessionID { get; set; }

        public string? StripePaymentIntentID { get; set; }

        public int? PaymentOrderID { get; set; }

        public string? Payload { get; set; }

        public DateTime ReceivedDate { get; set; } = DateTime.UtcNow;

        public DateTime? ProcessedDate { get; set; }

        public PaymentOrder? PaymentOrder { get; set; }
    }
}
