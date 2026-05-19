namespace AutoKosova.Business.DTOs.Accounts
{
    public class AccountUpdateRequestDto
    {
        public int AccountRoleID { get; set; }
        public string AccountUsername { get; set; } = string.Empty;
        public string AccountEmail { get; set; } = string.Empty;
        public string? Password { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public string AccountLastname { get; set; } = string.Empty;
        public string? AccountPhoneNumber { get; set; }
        public string? AccountAddress { get; set; }
        public string? AccountCity { get; set; }
        public bool AccountIsActive { get; set; }
    }
}
