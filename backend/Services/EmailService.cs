using System.Net;
using System.Net.Mail;

namespace backend.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
        Task SendBirthdayVoucherEmailAsync(string toEmail, string voucherCode, decimal discountAmount);
        Task SendVoucherEmailAsync(string toEmail, string voucherCode, decimal discountAmount, string title);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var host = _config["Email:Host"] ?? "smtp.gmail.com";
            var port = _config.GetValue<int>("Email:Port", 587);
            var fromEmail = _config["Email:FromEmail"];
            var appPassword = _config["Email:AppPassword"];

            if (string.IsNullOrEmpty(fromEmail) || string.IsNullOrEmpty(appPassword) || appPassword == "yourapppasswordhere")
            {
                Console.WriteLine($"[Email Service Mock] Gửi mail tới {toEmail} thành công! (Do chưa cấu hình App Password thật trong appsettings.json)");
                return;
            }

            var smtpClient = new SmtpClient(host)
            {
                Port = port,
                Credentials = new NetworkCredential(fromEmail, appPassword),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail),
                Subject = subject,
                Body = body,
                IsBodyHtml = true,
            };
            mailMessage.To.Add(toEmail);

            try
            {
                await smtpClient.SendMailAsync(mailMessage);
                Console.WriteLine($"[Email Service] Gửi mail tới {toEmail} thành công qua SMTP!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending email: {ex.Message}");
            }
        }

        public async Task SendBirthdayVoucherEmailAsync(string toEmail, string voucherCode, decimal discountAmount)
        {
            await SendVoucherEmailAsync(toEmail, voucherCode, discountAmount, "Chúc Mừng Sinh Nhật!");
        }

        public async Task SendVoucherEmailAsync(string toEmail, string voucherCode, decimal discountAmount, string title)
        {
            string subject = $"{title} - Quà tặng từ khách sạn";
            string body = $@"
                <div style='font-family: Arial, sans-serif; padding: 20px;'>
                    <h2 style='color: #d9534f;'>{title}</h2>
                    <p>Chào bạn,</p>
                    <p>Chúng tôi dành tặng bạn một Voucher giảm giá cực kỳ đặc biệt!</p>
                    <div style='background-color: #f9f9f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;'>
                        <h3 style='margin: 0; color: #333;'>Mã Voucher của bạn:</h3>
                        <p style='font-size: 24px; font-weight: bold; color: #d9534f; margin: 10px 0;'>{voucherCode}</p>
                        <p style='margin: 0;'>Giảm giá: <strong>{discountAmount:N0} VND</strong></p>
                    </div>
                    <p>Voucher này chỉ sử dụng được 1 lần và gắn liền với tài khoản của bạn. Vui lòng đưa mã này cho lễ tân khi thanh toán.</p>
                    <p>Trân trọng,<br/>Đội ngũ Khách sạn</p>
                </div>
            ";

            await SendEmailAsync(toEmail, subject, body);
        }
    }
}
