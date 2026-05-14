namespace AutoKosova.Business.Models
{
    public class CarWriteCommand
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

    public class CarSearchCommand
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

    public class CarListModel
    {
        public int CarsID { get; set; }
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
        public bool IsForSale { get; set; }
        public decimal? SalePrice { get; set; }
        public bool IsForRent { get; set; }
        public decimal? RentalDailyPrice { get; set; }
        public string CarStatus { get; set; } = string.Empty;
        public DateTime CarCreationDate { get; set; }
    }

    public class CarDetailsModel : CarListModel
    {
        public int CreatedByAccountID { get; set; }
        public string? CarDescription { get; set; }
        public DateTime? CarUpdatedDate { get; set; }
    }

    public class CarMutationResult
    {
        public int CarID { get; set; }
    }

    public class PagedResult<T>
    {
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalRecords { get; set; }
        public int TotalPages { get; set; }
        public List<T> Data { get; set; } = new();
    }
}
