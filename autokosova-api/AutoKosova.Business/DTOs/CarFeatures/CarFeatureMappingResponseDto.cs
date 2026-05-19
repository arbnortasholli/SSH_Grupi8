namespace AutoKosova.Business.DTOs.CarFeatures
{
    public class CarFeatureMappingResponseDto
    {
        public int CarFeatureMappingID { get; set; }

        public int CarID { get; set; }

        public int CarFeatureID { get; set; }

        public required string CarFeatureName { get; set; }

        public string? CarFeatureDescription { get; set; }

        public int CarFeatureOrderNumber { get; set; }

        public DateTime CarFeatureMappingCreationDate { get; set; }
    }
}
