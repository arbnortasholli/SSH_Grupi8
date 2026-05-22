namespace AutoKosova.Business.DTOs.Tenants
{
    public class TenantCreateRequestDto
    {
        public int? OwnerAccountID { get; set; }

        public required string TenantName { get; set; }

        public string? TenantBusinessNumber { get; set; }

        public string? TenantEmail { get; set; }

        public string? TenantPhoneNumber { get; set; }

        public string? TenantCity { get; set; }

        public string? TenantAddress { get; set; }

        public bool TenantIsActive { get; set; } = true;
    }
}
