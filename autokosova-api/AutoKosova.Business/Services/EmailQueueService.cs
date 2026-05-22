using AutoKosova.DataAccess;
using AutoKosova.Entity;

namespace AutoKosova.Business.Services
{
    public class EmailQueueService
    {
        private readonly AppDbContext _context;

        public EmailQueueService(AppDbContext context)
        {
            _context = context;
        }

        public async Task EnqueueAsync(string toEmail, string subject, string body)
        {
            if (string.IsNullOrWhiteSpace(toEmail))
            {
                return;
            }

            var email = new EmailQueue
            {
                ToEmail = toEmail.Trim(),
                Subject = subject.Trim(),
                Body = body.Trim(),
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.EmailQueues.Add(email);
            await _context.SaveChangesAsync();
        }
    }
}
