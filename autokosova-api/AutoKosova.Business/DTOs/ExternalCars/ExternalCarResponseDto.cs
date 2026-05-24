namespace AutoKosova.Business.DTOs.ExternalCars
{
    public class ExternalCarResponseDto
    {
        public string ExternalId { get; set; } = string.Empty;

        public string Source { get; set; } = "Carapis";

        public string Name { get; set; } = string.Empty;

        public string? Brand { get; set; }

        public string? Model { get; set; }

        public string? Trim { get; set; }

        public int? Year { get; set; }

        public decimal? Price { get; set; }

        public string? Currency { get; set; }

        public int? Mileage { get; set; }

        public string? FuelType { get; set; }

        public string? Transmission { get; set; }

        public string? BodyType { get; set; }

        public string? Color { get; set; }

        public string? Engine { get; set; }

        public string? Drivetrain { get; set; }

        public string? ImageUrl { get; set; }

        public string? DetailUrl { get; set; }

        public bool? Available { get; set; }
    }
}
