namespace AutoKosova.Business.DTOs.Cars
{
    public class CarSearchRequestDto
    {
        public string? SearchTerm { get; set; }

        public string? Brand { get; set; }

        public string? Model { get; set; }

        public int? MinYear { get; set; }

        public int? MaxYear { get; set; }

        public int? MaxMileage { get; set; }

        public string? FuelType { get; set; }

        public string? Transmission { get; set; }

        public string? BodyType { get; set; }

        public string? Color { get; set; }

        public bool? IsForSale { get; set; }

        public bool? IsForRent { get; set; }

        public decimal? MinPrice { get; set; }

        public decimal? MaxPrice { get; set; }

        public string? Status { get; set; }

        public int PageNumber { get; set; } = 1;

        public int PageSize { get; set; } = 10;
    }
}