namespace AutoKosova.Business.DTOs.CarFavorites
{
    public class CarFavoriteResponseDto
    {
        public int CarFavoriteID { get; set; }

        public int CarID { get; set; }

        public string CarTitle { get; set; } = string.Empty;

        public string CarBrand { get; set; } = string.Empty;

        public string CarModel { get; set; } = string.Empty;

        public int CarYear { get; set; }

        public int CarMileage { get; set; }

        public bool IsForSale { get; set; }

        public decimal? SalePrice { get; set; }

        public bool IsForRent { get; set; }

        public decimal? RentalDailyPrice { get; set; }

        public string CarStatus { get; set; } = string.Empty;

        public DateTime CarFavoriteCreationDate { get; set; }
    }
}