namespace AutoKosova.Business.DTOs.CarImages
{
    public class CarImageReorderRequestDto
    {
        public List<CarImageOrderItemDto> Images { get; set; } = new();
    }

    public class CarImageOrderItemDto
    {
        public int CarImageID { get; set; }

        public int CarImageOrderNumber { get; set; }
    }
}
