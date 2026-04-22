namespace backend.DTOs.Audit
{
    public class AuditLogEventResponseDTO
    {
        public string EventId { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string ActionType { get; set; } = string.Empty;
        public string ActionLabel { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public string ObjectName { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string Detail { get; set; } = string.Empty;
    }
}
