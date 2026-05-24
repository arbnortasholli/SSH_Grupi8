namespace AutoKosova.Business.DTOs.ExternalCarRequests
{
    public class ExternalCarRequestResponseDto
    {
        public int ExternalCarRequestID { get; set; }

        public int AccountID { get; set; }

        public string AccountUsername { get; set; } = string.Empty;

        public string AccountEmail { get; set; } = string.Empty;

        public int? ReviewedByAccountID { get; set; }

        public string? ReviewedByUsername { get; set; }

        public string ExternalCarID { get; set; } = string.Empty;

        public string Source { get; set; } = string.Empty;

        public string CarName { get; set; } = string.Empty;

        public string? Brand { get; set; }

        public string? Model { get; set; }

        public int? Year { get; set; }

        public decimal? Price { get; set; }

        public string? Currency { get; set; }

        public int? Mileage { get; set; }

        public string? ImageUrl { get; set; }

        public string? DetailUrl { get; set; }

        public string? CustomerName { get; set; }

        public string? CustomerEmail { get; set; }

        public string? CustomerPhone { get; set; }

        public string? Message { get; set; }

        public string Status { get; set; } = string.Empty;

        public string? AdminComment { get; set; }

        public string CustomerDecision { get; set; } = string.Empty;

        public DateTime? CustomerDecisionAt { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? ReviewedAt { get; set; }
    }
}
