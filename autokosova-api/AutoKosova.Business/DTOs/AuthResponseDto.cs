namespace AutoKosova.Business.DTOs
{
    public class AuthResponseDto
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