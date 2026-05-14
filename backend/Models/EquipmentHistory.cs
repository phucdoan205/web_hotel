using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("EquipmentHistories")]
    public class EquipmentHistory
    {
        [Key]
        public int Id { get; set; }

        public int EquipmentId { get; set; }
        public Equipment? Equipment { get; set; }

        [Required]
        [StringLength(50)]
        public string ActionType { get; set; } = null!; // IMPORT, EXPORT, LIQUIDATE, ADJUST, NEW

        public int QuantityChanged { get; set; }
        public int PreviousQuantity { get; set; }
        public int NewQuantity { get; set; }

        [StringLength(255)]
        public string? Note { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int? CreatedById { get; set; }
        public User? CreatedBy { get; set; }
    }
}
