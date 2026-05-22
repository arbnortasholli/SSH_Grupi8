namespace AutoKosova.Entity
{
    public class TenantRequest
    {
        public int TenantRequestID { get; set; }

        public int AccountID { get; set; }

        public int? ReviewedByAccountID { get; set; }

        public int? CreatedTenantID { get; set; }

        public required string BusinessName { get; set; }

        public string? BusinessNumber { get; set; }

        public string? BusinessEmail { get; set; }

        public string? BusinessPhoneNumber { get; set; }

        public string? BusinessCity { get; set; }

        public string? BusinessAddress { get; set; }

        public string? Message { get; set; }

        public string Status { get; set; } = "Pending";

        public string? AdminComment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReviewedAt { get; set; }

        public Account? Account { get; set; }

        public Account? ReviewedByAccount { get; set; }

        public Tenant? CreatedTenant { get; set; }
    }
}
