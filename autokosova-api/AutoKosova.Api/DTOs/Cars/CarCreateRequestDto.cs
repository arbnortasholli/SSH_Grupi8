namespace AutoKosova.Api.DTOs.Cars
{
    public class CarCreateRequestDto
    {
        public int? TenantID { get; set; }

        public string CarTitle { get; set; } = string.Empty;

        public string CarBrand { get; set; } = string.Empty;

        public string CarModel { get; set; } = string.Empty;

        public int CarYear { get; set; }

        public int CarMileage { get; set; }

        public string? CarFuelType { get; set; }

        public string? CarTransmission { get; set; }

        public string? CarBodyType { get; set; }

        public string? CarColor { get; set; }

        public string? CarDescription { get; set; }

        public bool IsForSale { get; set; }

        public decimal? SalePrice { get; set; }

        public bool IsForRent { get; set; }

        public decimal? RentalDailyPrice { get; set; }

        public string CarStatus { get; set; } = "Available";
    }
}