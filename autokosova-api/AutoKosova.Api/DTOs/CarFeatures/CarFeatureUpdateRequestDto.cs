namespace AutoKosova.Api.DTOs.CarFeatures
{
    public class CarFeatureUpdateRequestDto
    {
        public required string CarFeatureName { get; set; }

        public string? CarFeatureDescription { get; set; }

        public bool CarFeatureIsActive { get; set; }

        public int CarFeatureOrderNumber { get; set; }
    }
}
