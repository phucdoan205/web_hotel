// backend/Services/AuditLogCleanupService.cs
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class AuditLogCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AuditLogCleanupService> _logger;

        public AuditLogCleanupService(IServiceProvider serviceProvider, ILogger<AuditLogCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await PerformCleanupAsync(stoppingToken);
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken); // chạy 1 lần/ngày
            }
        }

        // Public để controller gọi manual
        public async Task PerformCleanupAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var setting = await context.AuditLogSettings.FindAsync(1);
                if (setting == null)
                {
                    setting = new AuditLogSetting { Id = 1 };
                    context.AuditLogSettings.Add(setting);
                    await context.SaveChangesAsync(cancellationToken);
                }

                var cutoff = DateTime.UtcNow
                    .AddYears(-setting.RetentionYears)
                    .AddMonths(-setting.RetentionMonths)
                    .AddDays(-setting.RetentionDays)
                    .AddHours(-setting.RetentionHours)
                    .AddMinutes(-setting.RetentionMinutes)
                    .AddSeconds(-setting.RetentionSeconds);

                var oldLogs = await context.AuditLogs
                    .Where(l => l.LogDate < cutoff)
                    .ToListAsync(cancellationToken);

                if (oldLogs.Any())
                {
                    context.AuditLogs.RemoveRange(oldLogs);
                    await context.SaveChangesAsync(cancellationToken);

                    _logger.LogInformation("Đã xóa {Count} audit log cũ hơn {Years} năm {Months} tháng {Days} ngày {Hours} giờ {Minutes} phút {Seconds} giây.",
                        oldLogs.Count,
                        setting.RetentionYears, setting.RetentionMonths, setting.RetentionDays,
                        setting.RetentionHours, setting.RetentionMinutes, setting.RetentionSeconds);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi dọn dẹp AuditLog");
            }
        }
    }
}