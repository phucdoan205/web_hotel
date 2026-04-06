using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class BirthdayVoucherCronJob : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<BirthdayVoucherCronJob> _logger;

        public BirthdayVoucherCronJob(IServiceScopeFactory scopeFactory, ILogger<BirthdayVoucherCronJob> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Birthday Voucher Cron Job is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                // Run the job
                await GenerateAndSendBirthdayVouchersAsync();

                // Chờ đến nửa đêm hoặc chờ 24h để chạy lại. (Tạm thời để 24h)
                await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
            }
        }

        private async Task GenerateAndSendBirthdayVouchersAsync()
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                var today = DateTime.Today;

                // Tìm những khách hàng có sinh nhật vào hôm nay. Bỏ qua những người chưa có email
                var birthdayUsers = await dbContext.Users
                    .Where(u => u.DateOfBirth.HasValue &&
                                u.DateOfBirth.Value.Month == today.Month &&
                                u.DateOfBirth.Value.Day == today.Day &&
                                !string.IsNullOrEmpty(u.Email))
                    .ToListAsync();

                foreach (var user in birthdayUsers)
                {
                    // Tránh gửi lại nếu đã tạo cho năm nay (có thể kiểm tra bằng mã voucher BDAY-YYYY-USERID)
                    var yearSuffix = today.ToString("yyyy");
                    var code = $"BDAY-{yearSuffix}-{user.Id}";

                    var exists = await dbContext.Vouchers.AnyAsync(v => v.Code == code);
                    if (!exists)
                    {
                        // Giảm 200k như yêu cầu
                        var voucher = new Voucher
                        {
                            Code = code,
                            DiscountType = "fixed",
                            DiscountValue = 200000, 
                            MinBookingValue = 0,
                            ValidFrom = today,
                            ValidTo = today.AddDays(7), // Hạn dùng 7 ngày
                            UsageLimit = 1,
                            UsageCount = 0,
                            IsActive = true,
                            UserId = user.Id 
                        };

                        dbContext.Vouchers.Add(voucher);
                        
                        // Gửi email
                        await emailService.SendBirthdayVoucherEmailAsync(user.Email, code, voucher.DiscountValue);
                        _logger.LogInformation($"Created and sent Birthday Voucher {code} to {user.Email}");
                    }
                }

                await dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while executing Birthday Voucher Cron Job.");
            }
        }
    }
}
