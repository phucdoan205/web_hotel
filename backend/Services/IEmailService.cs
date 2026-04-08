namespace backend.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string htmlBody, bool isHtml = true);
    }
}
