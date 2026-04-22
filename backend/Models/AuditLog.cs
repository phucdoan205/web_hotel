using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    
    public class AuditLog
    {
        public int Id { get; set; }
        public int? UserId { get; set; }

        public DateTime LogDate { get; set; } = DateTime.Now;

        /// <summary>
        /// JSON chứa toàn bộ events (TotalEvents + danh sách Events)
        /// </summary>
        public string LogData { get; set; } = string.Empty;
        public User? User { get; set; }
    }
}

