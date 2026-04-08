using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace backend.Services
{
    public class SmtpEmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public SmtpEmailService(IConfiguration config)
        {
            _config = config;
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

            var message = new MailMessage();
            message.From = new MailAddress(from ?? user ?? "no-reply@example.com", fromName ?? "Hotel");
            message.To.Add(new MailAddress(to));
            message.Subject = subject;
            message.Body = htmlBody;
            message.IsBodyHtml = isHtml;

            using var client = new SmtpClient(host, port);
            client.EnableSsl = enableSsl;
            if (!string.IsNullOrWhiteSpace(user))
            {
                client.Credentials = new NetworkCredential(user, pass);
            }

            // SmtpClient does not have an async SendMail in older APIs, use Task.Run
            return Task.Run(() => client.Send(message));
        }
    }
}
