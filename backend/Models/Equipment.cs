using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Equipments")]
    public class Equipment
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string ItemCode { get; set; } = null!;

        [Required]
        [StringLength(255)]
        public string Name { get; set; } = null!;

        [Required]
        [StringLength(100)]
        public string Category { get; set; } = null!;

        [Required]
        [StringLength(50)]
        public string Unit { get; set; } = null!;

        public int TotalQuantity { get; set; }
        public int InUseQuantity { get; set; }
        public int DamagedQuantity { get; set; }
        public int LiquidatedQuantity { get; set; }
        public int? InStockQuantity { get; set; }
        public decimal BasePrice { get; set; }
        public decimal DefaultPriceIfLost { get; set; }

        [StringLength(255)]
        public string? Supplier { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? ImageUrl { get; set; }

        public ICollection<RoomInventory> RoomInventories { get; set; } = new List<RoomInventory>();
    }
}
