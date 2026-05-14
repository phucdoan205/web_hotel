namespace backend.DTOs.Dashboard
{
    public class DashboardHistoryItemDto
    {
        public int Id { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string DashboardCode { get; set; } = string.Empty;
        public string PeriodType { get; set; } = string.Empty;
        public string PeriodKey { get; set; } = string.Empty;
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsCurrent { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
