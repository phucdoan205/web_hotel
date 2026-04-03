using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Equipments")]
    public class Equipment
    {
        public int Id { get; set; }
        public string ItemCode { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Category { get; set; } = null!;
        public string Unit { get; set; } = null!;
        public int TotalQuantity { get; set; }
        public int InUseQuantity { get; set; }
        public int DamagedQuantity { get; set; }
        public int LiquidatedQuantity { get; set; }
        public int? InStockQuantity { get; set; }
        public decimal BasePrice { get; set; }
        public decimal DefaultPriceIfLost { get; set; }
        public string? Supplier { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? ImageUrl { get; set; }

        public ICollection<RoomInventory> RoomInventories { get; set; } = new List<RoomInventory>();
    }
}
