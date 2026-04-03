using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("RoomInventory")]
    public class RoomInventory
    {
        public int Id { get; set; }
        public int? RoomId { get; set; }
        public int? Quantity { get; set; }
        public decimal? PriceIfLost { get; set; }
        public string? Note { get; set; }
        public bool IsActive { get; set; } = true;
        public string? ItemType { get; set; }
        public int? EquipmentId { get; set; }

        public Room? Room { get; set; }
        public Equipment? Equipment { get; set; }
        public ICollection<LossAndDamage> LossAndDamages { get; set; } = new List<LossAndDamage>();
    }
}

