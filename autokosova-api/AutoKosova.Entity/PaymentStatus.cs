namespace AutoKosova.Entity
{
    public class PaymentStatus
    {
        public int PaymentStatusID { get; set; }

        public required string PaymentStatusName { get; set; }

        public string? PaymentStatusDescription { get; set; }

        public ICollection<PaymentOrder> PaymentOrders { get; set; } = new List<PaymentOrder>();
    }
}
