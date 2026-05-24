namespace AutoKosova.Business.DTOs.ExternalCars
{
    public class ExternalCarListResponseDto
    {
        public int Page { get; set; }

        public int PageSize { get; set; }

        public int TotalRecords { get; set; }

        public bool Cached { get; set; }

        public List<ExternalCarResponseDto> Data { get; set; } = new();
    }
}
