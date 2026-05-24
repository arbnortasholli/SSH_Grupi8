namespace AutoKosova.Entity
{
    public class ExternalCarRequest
    {
        public int ExternalCarRequestID { get; set; }

        public int AccountID { get; set; }

        public int? ReviewedByAccountID { get; set; }

        public required string ExternalCarID { get; set; }

        public string Source { get; set; } = "Carapis";

        public required string CarName { get; set; }

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

        public string Status { get; set; } = "Pending";

        public string? AdminComment { get; set; }

        public string CustomerDecision { get; set; } = "Pending";

        public DateTime? CustomerDecisionAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReviewedAt { get; set; }

        public Account? Account { get; set; }

        public Account? ReviewedByAccount { get; set; }
    }
}
