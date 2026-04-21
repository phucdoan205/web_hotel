using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("AuditLogSettings")]
    public class AuditLogSetting
    {
        public int Id { get; set; } = 1;

        // === Thời gian giữ log (retention) ===
        public int RetentionYears { get; set; } = 0;
        public int RetentionMonths { get; set; } = 6;
        public int RetentionDays { get; set; } = 0;
        public int RetentionHours { get; set; } = 0;
        public int RetentionMinutes { get; set; } = 0;
        public int RetentionSeconds { get; set; } = 0;

        // === Lịch chạy dọn dẹp tự động (mới) ===
        public int CleanupIntervalYears { get; set; } = 0;
        public int CleanupIntervalMonths { get; set; } = 0; // Mặc định: mỗi 3 tháng
        public int CleanupIntervalDays { get; set; } = 0;
        public int CleanupIntervalHours { get; set; } = 0;
        public int CleanupIntervalMinutes { get; set; } = 0;
        public int CleanupIntervalSeconds { get; set; } = 0;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}