namespace AutoKosova.Business.DTOs.ExternalCarRequests
{
    public class ExternalCarRequestStatusUpdateDto
    {
        public required string Status { get; set; }

        public decimal? Price { get; set; }

        public string? Currency { get; set; }

        public string? AdminComment { get; set; }
    }
}
