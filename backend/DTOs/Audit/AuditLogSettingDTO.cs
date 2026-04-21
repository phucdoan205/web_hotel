namespace backend.DTOs.Audit
{
    public class AuditLogSettingDTO
    {
        public int RetentionYears { get; set; } = 0;
        public int RetentionMonths { get; set; } = 3;
        public int RetentionDays { get; set; } = 0;
        public int RetentionHours { get; set; } = 0;
        public int RetentionMinutes { get; set; } = 0;
        public int RetentionSeconds { get; set; } = 0;
    }
}