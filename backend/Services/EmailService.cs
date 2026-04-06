using System.Net;
using System.Net.Mail;

namespace backend.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
        Task SendBirthdayVoucherEmailAsync(string toEmail, string voucherCode, decimal discountAmount);
    }

    public class EmailService : IEmailService
    {
        // Sử dụng một tài khoản email chung chung hoặc cấu hình appsettings.
        // Tạm thời hardcode tài khoản để demo theo yêu cầu code nhanh.
        private readonly string _fromEmail = "hotelvoucherservice2026@gmail.com";
        private readonly string _appPassword = "dummy_app_password_here"; // Cần thay bằng app password thật

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var smtpClient = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential(_fromEmail, _appPassword),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_fromEmail),
                Subject = subject,
                Body = body,
                IsBodyHtml = true,
            };
            mailMessage.To.Add(toEmail);

            try
            {
                // Comment lại phần thực sự gửi mail nếu chưa có pass thật để khỏi bị crash
                // await smtpClient.SendMailAsync(mailMessage);
                await Task.CompletedTask;
                Console.WriteLine($"[Email Service] Gửi mail tới {toEmail} thành công! (Mock)");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending email: {ex.Message}");
            }
        }

        public async Task SendBirthdayVoucherEmailAsync(string toEmail, string voucherCode, decimal discountAmount)
        {
            string subject = "Chúc mừng sinh nhật! Quà tặng từ khách sạn";
            string body = $@"
                <div style='font-family: Arial, sans-serif; padding: 20px;'>
                    <h2 style='color: #d9534f;'>Chúc Mừng Sinh Nhật!</h2>
                    <p>Chào bạn,</p>
                    <p>Nhân dịp sinh nhật của bạn, chúng tôi dành tặng bạn một Voucher giảm giá cực kỳ đặc biệt!</p>
                    <div style='background-color: #f9f9f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;'>
                        <h3 style='margin: 0; color: #333;'>Mã Voucher của bạn:</h3>
                        <p style='font-size: 24px; font-weight: bold; color: #d9534f; margin: 10px 0;'>{voucherCode}</p>
                        <p style='margin: 0;'>Giảm giá: <strong>{discountAmount:N0} VND</strong></p>
                    </div>
                    <p>Voucher này chỉ sử dụng được 1 lần và gắn liên với tài khoản của bạn. Vui lòng đưa mã này cho lễ tân khi thanh toán.</p>
                    <p>Chúc bạn một ngày sinh nhật thật ý nghĩa!</p>
                    <p>Trân trọng,<br/>Đội ngũ Khách sạn</p>
                </div>
            ";

            await SendEmailAsync(toEmail, subject, body);
        }
    }
}
