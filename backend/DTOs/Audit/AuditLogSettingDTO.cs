namespace backend.DTOs.Audit
{
    public class AuditLogSettingDTO
    {
        // === Retention (giữ log bao lâu) ===
        public int RetentionYears { get; set; } = 0;
        public int RetentionMonths { get; set; } = 6;
        public int RetentionDays { get; set; } = 0;
        public int RetentionHours { get; set; } = 0;
        public int RetentionMinutes { get; set; } = 0;
        public int RetentionSeconds { get; set; } = 0;

        // === Cleanup Interval (chỉ giữ năm, tháng, ngày) ===
        public int CleanupIntervalYears { get; set; } = 0;
        public int CleanupIntervalMonths { get; set; } = 3;
        public int CleanupIntervalDays { get; set; } = 0;

        // === Giờ cố định (mới) ===
        public int CleanupHour { get; set; } = 2;      // mặc định 02:00 sáng
        public int CleanupMinute { get; set; } = 0;
    }
}