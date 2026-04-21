using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class AuditLogCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AuditLogCleanupService> _logger;

        public AuditLogCleanupService(
            IServiceProvider serviceProvider,
            ILogger<AuditLogCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                    var cutoffDate = DateTime.UtcNow.AddMonths(-3); // 3 tháng

                    var oldLogs = await context.AuditLogs
                        .Where(l => l.LogDate < cutoffDate)
                        .ToListAsync(stoppingToken);

                    if (oldLogs.Any())
                    {
                        context.AuditLogs.RemoveRange(oldLogs);
                        await context.SaveChangesAsync(stoppingToken);

                        _logger.LogInformation(
                            "Đã tự động xóa {Count} audit log cũ hơn 3 tháng.",
                            oldLogs.Count);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi dọn dẹp AuditLog");
                }

                // Chạy 1 lần/ngày
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}