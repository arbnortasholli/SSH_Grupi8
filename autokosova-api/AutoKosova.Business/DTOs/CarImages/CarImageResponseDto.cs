namespace AutoKosova.Business.DTOs.CarImages
{
    public class CarImageResponseDto
    {
        public int CarImageID { get; set; }

        public int CarID { get; set; }

        public string CarImageUrl { get; set; } = string.Empty;

        public bool CarImageIsMain { get; set; }

        public int CarImageOrderNumber { get; set; }

        public DateTime CarImageCreationDate { get; set; }
    }
}