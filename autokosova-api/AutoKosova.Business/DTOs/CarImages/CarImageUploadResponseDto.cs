namespace AutoKosova.Business.DTOs.CarImages
{
    public class CarImageUploadResponseDto
    {
        public int CarID { get; set; }

        public List<CarImageResponseDto> Images { get; set; } = new();
    }
}
