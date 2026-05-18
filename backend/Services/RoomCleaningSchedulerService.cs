using backend.Common;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class RoomCleaningSchedulerService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<RoomCleaningSchedulerService> _logger;

        public RoomCleaningSchedulerService(IServiceProvider serviceProvider, ILogger<RoomCleaningSchedulerService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("RoomCleaningSchedulerService is starting.");

            // Chờ 20 giây trước khi bắt đầu để đảm bảo DB đã sẵn sàng và tránh xung đột khởi động
            try { await Task.Delay(TimeSpan.FromSeconds(20), stoppingToken); }
            catch (OperationCanceledException) { return; }

            while (!stoppingToken.IsCancellationRequested)
            {
                var vietnamNow = GetVietnamTime();
                var nextRun = GetNextRunTime(vietnamNow);
                var delay = nextRun - vietnamNow;

                if (delay < TimeSpan.Zero)
                {
                    delay = TimeSpan.FromSeconds(5);
                }

                _logger.LogInformation("Lịch tự động chuyển trạng thái phòng sang Pickup tiếp theo lúc {NextRun:yyyy-MM-dd HH:mm:ss} (sau {Delay})", nextRun, delay);

                try
                {
                    await Task.Delay(delay, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }

                await PerformAutoStatusChangeAsync(stoppingToken);
            }
        }

        private async Task PerformAutoStatusChangeAsync(CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Bắt đầu tự động chuyển trạng thái tất cả các phòng sang 'Pickup' (dọn nhẹ)...");

                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var rooms = await context.Rooms
                    .Where(r => !r.IsDeleted)
                    .ToListAsync(cancellationToken);

                int count = 0;
                foreach (var room in rooms)
                {
                    room.CleaningStatus = RoomCleaningStatuses.Pickup;
                    room.LastCleaningUpdatedAt = DateTime.UtcNow;
                    count++;
                }

                if (count > 0)
                {
                    await context.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation("Đã tự động chuyển thành công {Count} phòng sang trạng thái 'Pickup'.", count);
                }
                else
                {
                    _logger.LogInformation("Không có phòng nào để cập nhật.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi xảy ra trong quá trình tự động cập nhật trạng thái dọn dẹp phòng.");
            }
        }

        private static DateTime GetVietnamTime()
        {
            var utcNow = DateTime.UtcNow;
            try
            {
                var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
                return TimeZoneInfo.ConvertTimeFromUtc(utcNow, vietnamTimeZone);
            }
            catch (TimeZoneNotFoundException)
            {
                var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh");
                return TimeZoneInfo.ConvertTimeFromUtc(utcNow, vietnamTimeZone);
            }
        }

        private static DateTime GetNextRunTime(DateTime vietnamNow)
        {
            var today10Am = vietnamNow.Date.AddHours(10);
            var today5Pm = vietnamNow.Date.AddHours(17);

            if (vietnamNow < today10Am)
            {
                return today10Am;
            }
            else if (vietnamNow < today5Pm)
            {
                return today5Pm;
            }
            else
            {
                return vietnamNow.Date.AddDays(1).AddHours(10);
            }
        }
    }
}
