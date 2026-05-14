namespace backend.DTOs.Dashboard
{
    public class DashboardRebuildRequestDto
    {
        public string RoleName { get; set; } = string.Empty;
        public string PeriodType { get; set; } = string.Empty;
        public DateTime? OccurredAtUtc { get; set; }
    }
}
