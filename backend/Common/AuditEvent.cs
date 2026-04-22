namespace backend.Common
{
    public class AuditEvent
    {
        public string EventId { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string ActionType { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public object Context { get; set; } = new();
        public object Changes { get; set; } = new();
        public string Message { get; set; } = string.Empty;
    }
}
