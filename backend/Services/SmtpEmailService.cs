using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    public class SmtpEmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<SmtpEmailService> _logger;

        public SmtpEmailService(IConfiguration config, ILogger<SmtpEmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public Task SendEmailAsync(string to, string subject, string htmlBody, bool isHtml = true)
        {
            var smtp = _config.GetSection("Smtp");
            var host = smtp.GetValue<string>("Host");
            var port = smtp.GetValue<int>("Port");
            var user = smtp.GetValue<string>("User");
            var pass = smtp.GetValue<string>("Pass");
            var enableSsl = smtp.GetValue<bool>("EnableSsl");
            var from = smtp.GetValue<string>("From");
            var fromName = smtp.GetValue<string>("FromName");

            if (string.IsNullOrWhiteSpace(host))
            {
                _logger.LogWarning("SMTP host is not configured.");
                throw new InvalidOperationException("SMTP host not configured");
            }

            _logger.LogInformation("Sending email via SMTP {Host}:{Port} from {From}", host, port, from ?? user);

            var message = new MailMessage();
            message.From = new MailAddress(from ?? user ?? "no-reply@example.com", fromName ?? "Hotel");
            message.To.Add(new MailAddress(to));
            message.Subject = subject;
            message.Body = htmlBody;
            message.IsBodyHtml = isHtml;

            var client = new SmtpClient(host, port);
            client.EnableSsl = enableSsl;
            if (!string.IsNullOrWhiteSpace(user))
            {
                client.Credentials = new NetworkCredential(user, pass);
            }

            try
            {
                // Use async API when available
                var sendTask = client.SendMailAsync(message);
                return sendTask;
            }
            catch (System.MissingMethodException)
            {
                // fallback to Task.Run if SendMailAsync not available
                return Task.Run(() => client.Send(message));
            }
        }
    }
}
