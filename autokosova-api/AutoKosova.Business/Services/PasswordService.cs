using System.Security.Cryptography;
using System.Text;

namespace AutoKosova.Business.Services
{
    public class PasswordService
    {
        public void CreatePasswordHash(string password, out string passwordHash, out byte[] passwordSalt)
        {
            using var hmac = new HMACSHA512();

            passwordSalt = hmac.Key;

            var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

            passwordHash = Convert.ToBase64String(hashBytes);
        }

        public bool VerifyPasswordHash(string password, string storedPasswordHash, byte[] storedPasswordSalt)
        {
            using var hmac = new HMACSHA512(storedPasswordSalt);

            var computedHashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

            var computedHash = Convert.ToBase64String(computedHashBytes);

            return computedHash == storedPasswordHash;
        }
    }
}
