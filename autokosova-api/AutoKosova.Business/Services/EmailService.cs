using System.Net;
using System.Net.Mail;
using AutoKosova.Business.Interfaces;
using Microsoft.Extensions.Configuration;

namespace AutoKosova.Business.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendAsync(string toEmail, string subject, string body)
        {
            var host = _configuration["EmailSettings:SmtpHost"];
            var portValue = _configuration["EmailSettings:SmtpPort"];
            var username = _configuration["EmailSettings:Username"];
            var password = _configuration["EmailSettings:Password"]?.Replace(" ", string.Empty);
            var fromEmail = _configuration["EmailSettings:FromEmail"];
            var fromName = _configuration["EmailSettings:FromName"] ?? "AutoKosova";

            if (string.IsNullOrWhiteSpace(host) ||
                string.IsNullOrWhiteSpace(portValue) ||
                string.IsNullOrWhiteSpace(username) ||
                string.IsNullOrWhiteSpace(password) ||
                string.IsNullOrWhiteSpace(fromEmail))
            {
                throw new InvalidOperationException("Email settings are not configured.");
            }

            if (!int.TryParse(portValue, out var port))
            {
                throw new InvalidOperationException("EmailSettings:SmtpPort is not valid.");
            }

            using var client = new SmtpClient(host, port)
            {
                EnableSsl = true,
                UseDefaultCredentials = false,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Credentials = new NetworkCredential(username, password)
            };

            using var message = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = false
            };

            message.To.Add(toEmail);

            await client.SendMailAsync(message);
        }
    }
}
