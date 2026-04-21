using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("AuditLogSettings")]
    public class AuditLogSetting
    {
        public int Id { get; set; } = 1;

        public int RetentionYears { get; set; } = 0;
        public int RetentionMonths { get; set; } = 3;   // mặc định 3 tháng
        public int RetentionDays { get; set; } = 0;
        public int RetentionHours { get; set; } = 0;
        public int RetentionMinutes { get; set; } = 0;
        public int RetentionSeconds { get; set; } = 0;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}