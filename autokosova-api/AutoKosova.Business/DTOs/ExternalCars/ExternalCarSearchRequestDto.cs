namespace AutoKosova.Business.DTOs.ExternalCars
{
    public class ExternalCarSearchRequestDto
    {
        public int Page { get; set; } = 1;

        public int PageSize { get; set; } = 20;

        public bool AvailableOnly { get; set; } = false;

        public string? Brand { get; set; }

        public string? Model { get; set; }

        public int? YearFrom { get; set; }

        public int? YearTo { get; set; }

        public decimal? PriceFrom { get; set; }

        public decimal? PriceTo { get; set; }

        public int? MileageFrom { get; set; }

        public int? MileageTo { get; set; }

        public string? OrderBy { get; set; }
    }
}
