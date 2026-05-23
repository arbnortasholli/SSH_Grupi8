namespace AutoKosova.Business.Services
{
    public static class PaymentConstants
    {
        public const string ProviderStripe = "Stripe";

        public const int PaymentStatusPending = 1;
        public const int PaymentStatusPaid = 2;
        public const int PaymentStatusFailed = 3;
        public const int PaymentStatusCancelled = 4;
        public const int PaymentStatusRefunded = 5;

        public const string RentalStatusPendingPayment = "PendingPayment";
        public const string RentalStatusConfirmed = "Confirmed";
        public const string RentalStatusCancelled = "Cancelled";
        public const string RentalStatusCompleted = "Completed";
    }
}
