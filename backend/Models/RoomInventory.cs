using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("room_inventory")]
    public class RoomInventory
    {
        public int Id { get; set; }

        [Column("room_id")]
        public int? RoomId { get; set; }

        [Column("item_name")]
        public string ItemName { get; set; } = null!;

        [Column("quantity")]
        public int? Quantity { get; set; }

        [Column("price_if_lost")]
        public decimal? PriceIfLost { get; set; }

        public Room? Room { get; set; }
        public ICollection<LossAndDamage> LossAndDamages { get; set; } = new List<LossAndDamage>();
    }
}

