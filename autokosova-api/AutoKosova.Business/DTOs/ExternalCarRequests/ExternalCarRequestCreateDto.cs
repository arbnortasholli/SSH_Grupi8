namespace AutoKosova.Business.DTOs.ExternalCarRequests
{
    public class ExternalCarRequestCreateDto
    {
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
    }
}
