namespace AutoKosova.Business.DTOs.TenantRequests
{
    public class TenantRequestReviewDto
    {
        public string Status { get; set; } = string.Empty;

        public string? AdminComment { get; set; }
    }
}
