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
                var delay = await CalculateNextDelayAsync(stoppingToken);
                await WaitForDelayAsync(delay, stoppingToken);
                await PerformCleanupAsync(stoppingToken);
            }
        }

        private async Task<TimeSpan> CalculateNextDelayAsync(CancellationToken cancellationToken)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                await EnsureDefaultSettingsAsync(context, cancellationToken);
                var settings = await GetAllSettingsAsync(context, cancellationToken);

                int intervalYears = GetIntSetting(settings, "CleanupIntervalYears");
                int intervalMonths = GetIntSetting(settings, "CleanupIntervalMonths");
                int intervalDays = GetIntSetting(settings, "CleanupIntervalDays");

                int cleanupHour = GetIntSetting(settings, "CleanupHour", 20);
                int cleanupMinute = GetIntSetting(settings, "CleanupMinute", 0);

                var now = DateTime.Now;
                var fixedTime = new TimeSpan(cleanupHour, cleanupMinute, 0);

                // Tính candidate = now + interval (chỉ năm/tháng/ngày)
                var candidate = now
                    .AddYears(intervalYears)
                    .AddMonths(intervalMonths)
                    .AddDays(intervalDays);

                var nextRun = candidate.Date + fixedTime;

                // Nếu interval = 0 (không có năm/tháng/ngày) → coi như chạy HÀNG NGÀY
                bool isDaily = intervalYears == 0 && intervalMonths == 0 && intervalDays == 0;

                if (isDaily)
                {
                    nextRun = now.Date + fixedTime;
                    if (nextRun <= now)
                        nextRun = nextRun.AddDays(1);
                }
                else if (nextRun <= now)
                {
                    // Chưa đến giờ hôm nay → chuyển sang chu kỳ tiếp theo
                    nextRun = nextRun
                        .AddYears(intervalYears)
                        .AddMonths(intervalMonths)
                        .AddDays(intervalDays);
                    nextRun = nextRun.Date + fixedTime;
                }

                var delay = nextRun - now;
                if (delay < TimeSpan.FromMinutes(1))
                    delay = TimeSpan.FromMinutes(1);

                _logger.LogInformation("Lịch dọn dẹp tiếp theo lúc {NextRun:yyyy-MM-dd HH:mm:ss} (sau {Delay})",
                    nextRun, delay);

                return delay;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tính delay cho AuditLogCleanup");
                return TimeSpan.FromMinutes(5);
            }
        }

        // WaitForDelayAsync và PerformCleanupAsync giữ nguyên như lần trước
        private async Task WaitForDelayAsync(TimeSpan delay, CancellationToken cancellationToken)
        {
            if (delay <= TimeSpan.Zero) return;

            const long maxChunkMs = 24 * 60 * 60 * 1000L;

            var remaining = delay;
            while (remaining > TimeSpan.Zero && !cancellationToken.IsCancellationRequested)
            {
                var chunk = remaining.TotalMilliseconds < maxChunkMs
                    ? remaining
                    : TimeSpan.FromMilliseconds(maxChunkMs);

                await Task.Delay(chunk, cancellationToken);
                remaining -= chunk;
            }
        }

        public async Task PerformCleanupAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                await EnsureDefaultSettingsAsync(context, cancellationToken);
                var settings = await GetAllSettingsAsync(context, cancellationToken);

                var cutoff = DateTime.UtcNow
                    .AddYears(-GetIntSetting(settings, "RetentionYears"))
                    .AddMonths(-GetIntSetting(settings, "RetentionMonths"))
                    .AddDays(-GetIntSetting(settings, "RetentionDays"))
                    .AddHours(-GetIntSetting(settings, "RetentionHours"))
                    .AddMinutes(-GetIntSetting(settings, "RetentionMinutes"))
                    .AddSeconds(-GetIntSetting(settings, "RetentionSeconds"));

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
                await Task.Delay(TimeSpan.FromMinutes(5), cancellationToken);
            }
        }

        private async Task EnsureDefaultSettingsAsync(AppDbContext context, CancellationToken cancellationToken)
        {
            var existingNames = await context.AuditLogSettings
                .Select(s => s.ConfigName)
                .ToListAsync(cancellationToken);

            var defaults = new Dictionary<string, string>
            {
                { "RetentionYears", "0" }, { "RetentionMonths", "6" }, { "RetentionDays", "0" },
                { "RetentionHours", "0" }, { "RetentionMinutes", "0" }, { "RetentionSeconds", "0" },

                { "CleanupIntervalYears", "0" }, { "CleanupIntervalMonths", "3" }, { "CleanupIntervalDays", "0" },

                { "CleanupHour", "20" }, { "CleanupMinute", "0" }
            };

            bool changed = false;
            foreach (var kv in defaults)
            {
                if (!existingNames.Contains(kv.Key))
                {
                    context.AuditLogSettings.Add(new AuditLogSetting
                    {
                        ConfigName = kv.Key,
                        Value = kv.Value,
                        UpdatedAt = DateTime.UtcNow
                    });
                    changed = true;
                }
            }

            if (changed)
                await context.SaveChangesAsync(cancellationToken);
        }

        private async Task<Dictionary<string, string>> GetAllSettingsAsync(AppDbContext context, CancellationToken cancellationToken)
        {
            return await context.AuditLogSettings
                .ToDictionaryAsync(s => s.ConfigName, s => s.Value, cancellationToken);
        }

        private static int GetIntSetting(Dictionary<string, string> settings, string key, int defaultValue = 0)
        {
            return settings.TryGetValue(key, out var str) && int.TryParse(str, out var val) ? val : defaultValue;
        }
    }
}