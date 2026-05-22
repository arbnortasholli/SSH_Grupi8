using AutoKosova.Business.Interfaces;
using AutoKosova.DataAccess;
using Microsoft.EntityFrameworkCore;

namespace AutoKosova.Api.BackgroundJobs
{
    public class EmailQueueWorker : BackgroundService
    {
        private const int MaxRetryCount = 3;

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<EmailQueueWorker> _logger;
        private readonly IConfiguration _configuration;

        public EmailQueueWorker(
            IServiceScopeFactory scopeFactory,
            ILogger<EmailQueueWorker> logger,
            IConfiguration configuration)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _configuration = configuration;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                if (_configuration.GetValue<bool>("EmailSettings:Enabled"))
                {
                    try
                    {
                        await ProcessPendingEmailsAsync(stoppingToken);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Email queue worker failed while processing pending emails.");
                    }
                }

                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
        }

        private async Task ProcessPendingEmailsAsync(CancellationToken stoppingToken)
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            var pendingEmails = await context.EmailQueues
                .Where(email => email.Status == "Pending" && email.RetryCount < MaxRetryCount)
                .OrderBy(email => email.CreatedAt)
                .Take(10)
                .ToListAsync(stoppingToken);

            foreach (var email in pendingEmails)
            {
                try
                {
                    await emailService.SendAsync(email.ToEmail, email.Subject, email.Body);

                    email.Status = "Sent";
                    email.SentAt = DateTime.UtcNow;
                    email.ErrorMessage = null;
                }
                catch (Exception ex)
                {
                    email.RetryCount++;
                    email.Status = email.RetryCount >= MaxRetryCount ? "Failed" : "Pending";
                    email.ErrorMessage = ex.Message;

                    _logger.LogWarning(ex, "Email queue item {EmailQueueID} failed.", email.EmailQueueID);
                }
            }

            if (pendingEmails.Count > 0)
            {
                await context.SaveChangesAsync(stoppingToken);
            }
        }
    }
}
