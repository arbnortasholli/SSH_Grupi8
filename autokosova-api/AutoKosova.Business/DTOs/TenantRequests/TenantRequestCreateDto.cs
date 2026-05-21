namespace AutoKosova.Business.DTOs.TenantRequests
{
    public class TenantRequestCreateDto
    {
        public string BusinessName { get; set; } = string.Empty;

        public string? BusinessNumber { get; set; }

        public string? BusinessEmail { get; set; }

        public string? BusinessPhoneNumber { get; set; }

        public string? BusinessCity { get; set; }

        public string? BusinessAddress { get; set; }

        public string? Message { get; set; }
    }
}
