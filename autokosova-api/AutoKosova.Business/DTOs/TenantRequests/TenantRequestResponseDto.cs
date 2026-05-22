namespace AutoKosova.Business.DTOs.TenantRequests
{
    public class TenantRequestResponseDto
    {
        public int TenantRequestID { get; set; }

        public int AccountID { get; set; }

        public string AccountUsername { get; set; } = string.Empty;

        public string AccountEmail { get; set; } = string.Empty;

        public int? ReviewedByAccountID { get; set; }

        public string? ReviewedByUsername { get; set; }

        public int? CreatedTenantID { get; set; }

        public string BusinessName { get; set; } = string.Empty;

        public string? BusinessNumber { get; set; }

        public string? BusinessEmail { get; set; }

        public string? BusinessPhoneNumber { get; set; }

        public string? BusinessCity { get; set; }

        public string? BusinessAddress { get; set; }

        public string? Message { get; set; }

        public string Status { get; set; } = string.Empty;

        public string? AdminComment { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? ReviewedAt { get; set; }
    }
}
