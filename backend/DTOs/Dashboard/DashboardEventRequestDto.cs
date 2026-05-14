namespace backend.DTOs.Dashboard
{
    public class DashboardEventRequestDto
    {
        public string EventType { get; set; } = string.Empty;
        public int? RefId { get; set; }
        public DateTime? OccurredAtUtc { get; set; }
    }
}
