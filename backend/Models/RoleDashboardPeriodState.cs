using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Role_Dashboard_Period_States")]
    public class RoleDashboardPeriodState
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [Column("role_id")]
        public int RoleId { get; set; }

        [Required]
        [Column("role_name")]
        [StringLength(100)]
        public string RoleName { get; set; } = string.Empty;

        [Required]
        [Column("dashboard_code")]
        [StringLength(100)]
        public string DashboardCode { get; set; } = string.Empty;

        [Required]
        [Column("dashboard_title")]
        [StringLength(255)]
        public string DashboardTitle { get; set; } = string.Empty;

        [Required]
        [Column("period_type")]
        [StringLength(20)]
        public string PeriodType { get; set; } = string.Empty;

        [Required]
        [Column("period_key")]
        [StringLength(30)]
        public string PeriodKey { get; set; } = string.Empty;

        [Required]
        [Column("period_start")]
        public DateTime PeriodStart { get; set; }

        [Required]
        [Column("period_end")]
        public DateTime PeriodEnd { get; set; }

        [Required]
        [Column("dashboard_json")]
        public string DashboardJson { get; set; } = string.Empty;

        [Column("comparison_json")]
        public string? ComparisonJson { get; set; }

        [Required]
        [Column("status")]
        [StringLength(20)]
        public string Status { get; set; } = "OPEN";

        [Required]
        [Column("is_current")]
        public bool IsCurrent { get; set; } = false;

        [Column("last_event_type")]
        [StringLength(100)]
        public string? LastEventType { get; set; }

        [Column("last_event_source")]
        [StringLength(100)]
        public string? LastEventSource { get; set; }

        [Column("last_event_ref_id")]
        public int? LastEventRefId { get; set; }

        [Required]
        [Column("version")]
        public int Version { get; set; } = 1;

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("closed_at")]
        public DateTime? ClosedAt { get; set; }

        [Column("updated_by")]
        public int? UpdatedBy { get; set; }

        [ForeignKey(nameof(RoleId))]
        public virtual Role? Role { get; set; }

        [ForeignKey(nameof(UpdatedBy))]
        public virtual User? UpdatedByUser { get; set; }
    }
}
