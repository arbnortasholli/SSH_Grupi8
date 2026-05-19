namespace AutoKosova.Business.DTOs.CarFeatures
{
    public class CarFeatureResponseDto
    {
        public int CarFeatureID { get; set; }

        public required string CarFeatureName { get; set; }

        public string? CarFeatureDescription { get; set; }

        public bool CarFeatureIsActive { get; set; }

        public int CarFeatureOrderNumber { get; set; }

        public DateTime CarFeatureCreationDate { get; set; }
    }
}
