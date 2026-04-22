namespace backend.DTOs.Audit
{
    public class AuditLogResponseDTO
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string? UserName { get; set; }
        public string? RoleName { get; set; }
        public DateTime LogDate { get; set; }
        public string LogData { get; set; } = string.Empty;
    }
}