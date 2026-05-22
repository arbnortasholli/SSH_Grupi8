namespace AutoKosova.Business.DTOs.Tenants
{
    public class TenantResponseDto
    {
        public int TenantID { get; set; }

        public int? OwnerAccountID { get; set; }

        public string? OwnerUsername { get; set; }

        public string? OwnerEmail { get; set; }

        public required string TenantName { get; set; }

        public string? TenantBusinessNumber { get; set; }

        public string? TenantEmail { get; set; }

        public string? TenantPhoneNumber { get; set; }

        public string? TenantCity { get; set; }

        public string? TenantAddress { get; set; }

        public bool TenantIsActive { get; set; }

        public DateTime TenantCreationDate { get; set; }
    }
}
