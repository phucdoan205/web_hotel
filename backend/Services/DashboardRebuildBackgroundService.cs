using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace backend.Services;

public class DashboardRebuildBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DashboardRebuildBackgroundService> _logger;

    public DashboardRebuildBackgroundService(IServiceProvider serviceProvider, ILogger<DashboardRebuildBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DashboardRebuildBackgroundService is starting.");

        // Chờ 15 giây trước khi chạy lần đầu để tránh tranh chấp với khởi tạo DB của ứng dụng
        await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var dashboardService = scope.ServiceProvider.GetRequiredService<IRoleDashboardPeriodService>();
                
                await dashboardService.RebuildAllCurrentDashboardsAsync(null, stoppingToken);
                _logger.LogInformation("Successfully rebuilt all current dashboards at {time}", DateTime.UtcNow);
            }
            catch (Exception ex)
            {
                try { _logger.LogError(ex, "Error occurred executing dashboard rebuild."); }
                catch { Console.WriteLine($"[CRITICAL ERROR] Logging failed: {ex.Message}"); }
            }

            // Rebuild every 15 minutes
            await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
        }
    }
}
