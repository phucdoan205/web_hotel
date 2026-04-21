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
                await PerformCleanupAsync(stoppingToken);   // chỉ dọn dẹp

                var delay = await CalculateNextDelayAsync(stoppingToken);
                _logger.LogInformation("Lịch dọn dẹp tiếp theo sau {Delay}", delay);

                await Task.Delay(delay, stoppingToken);
            }
        }

        /// <summary>
        /// Chỉ thực hiện dọn dẹp theo Retention (có thể gọi thủ công từ nơi khác)
        /// </summary>
        public async Task PerformCleanupAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var setting = await GetOrCreateSettingAsync(context, cancellationToken);

                // 1. Tính cutoff theo Retention
                var cutoff = DateTime.UtcNow
                    .AddYears(-setting.RetentionYears)
                    .AddMonths(-setting.RetentionMonths)
                    .AddDays(-setting.RetentionDays)
                    .AddHours(-setting.RetentionHours)
                    .AddMinutes(-setting.RetentionMinutes)
                    .AddSeconds(-setting.RetentionSeconds);

                // Xóa theo batch để tránh OutOfMemory
                const int batchSize = 1000;
                int totalDeleted = 0;

                while (true)
                {
                    var oldLogs = await context.AuditLogs
                        .Where(l => l.LogDate < cutoff)
                        .Take(batchSize)
                        .ToListAsync(cancellationToken);

                    if (!oldLogs.Any()) break;

                    context.AuditLogs.RemoveRange(oldLogs);
                    await context.SaveChangesAsync(cancellationToken);

                    totalDeleted += oldLogs.Count;
                    _logger.LogInformation("Đã xóa batch {Count} audit log cũ (tổng: {Total}).", oldLogs.Count, totalDeleted);
                }

                if (totalDeleted > 0)
                    _logger.LogInformation("Hoàn tất dọn dẹp: xóa tổng cộng {Total} audit log cũ.", totalDeleted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi dọn dẹp AuditLog");
                await Task.Delay(TimeSpan.FromMinutes(5), cancellationToken); // retry
            }
        }

        private async Task<TimeSpan> CalculateNextDelayAsync(CancellationToken cancellationToken)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var setting = await GetOrCreateSettingAsync(context, cancellationToken);

                var nextRun = DateTime.UtcNow
                    .AddYears(setting.CleanupIntervalYears)
                    .AddMonths(setting.CleanupIntervalMonths)
                    .AddDays(setting.CleanupIntervalDays)
                    .AddHours(setting.CleanupIntervalHours)
                    .AddMinutes(setting.CleanupIntervalMinutes)
                    .AddSeconds(setting.CleanupIntervalSeconds);

                var delay = nextRun - DateTime.UtcNow;

                return delay < TimeSpan.FromMinutes(1)
                    ? TimeSpan.FromMinutes(1)
                    : delay;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tính delay cho AuditLogCleanup");
                return TimeSpan.FromMinutes(5); // fallback
            }
        }

        private static async Task<AuditLogSetting> GetOrCreateSettingAsync(
            AppDbContext context, CancellationToken cancellationToken)
        {
            var setting = await context.AuditLogSettings.FindAsync(new object[] { 1 }, cancellationToken);
            if (setting == null)
            {
                setting = new AuditLogSetting { Id = 1 };
                context.AuditLogSettings.Add(setting);
                await context.SaveChangesAsync(cancellationToken);
            }
            return setting;
        }
    }
}