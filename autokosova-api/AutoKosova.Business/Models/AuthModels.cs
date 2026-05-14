namespace AutoKosova.Business.Models
{
    public class RegisterAccountCommand
    {
        public int AccountRoleID { get; set; }
        public string AccountUsername { get; set; } = string.Empty;
        public string AccountEmail { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public string AccountLastname { get; set; } = string.Empty;
        public string? AccountPhoneNumber { get; set; }
        public string? AccountAddress { get; set; }
        public string? AccountCity { get; set; }
    }

    public class LoginCommand
    {
        public string EmailOrUsername { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterAccountResult
    {
        public int AccountID { get; set; }
    }

    public class AuthResult
    {
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public int AccountID { get; set; }
        public int AccountRoleID { get; set; }
        public string Role { get; set; } = string.Empty;
        public string AccountUsername { get; set; } = string.Empty;
        public string AccountEmail { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public string AccountLastname { get; set; } = string.Empty;
    }
}
