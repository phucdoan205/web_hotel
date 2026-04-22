namespace backend.DTOs.Audit
{
    public class AuditLogFilterOptionsDTO
    {
        public List<string> Roles { get; set; } = new();
        public List<string> Employees { get; set; } = new();
    }
}
