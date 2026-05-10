namespace AutoKosova.Api.DTOs.CarImages
{
    public class CarImageCreateRequestDto
    {
        public string CarImageUrl { get; set; } = string.Empty;

        public bool CarImageIsMain { get; set; }

        public int CarImageOrderNumber { get; set; }
    }
}