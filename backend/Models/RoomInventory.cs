using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    
    public class RoomInventory
    {
        public int Id { get; set; }
        public int? RoomId { get; set; }
        public string ItemName { get; set; } = null!;
        public int? Quantity { get; set; }
        public decimal? PriceIfLost { get; set; }
        public Room? Room { get; set; }
        public ICollection<LossAndDamage> LossAndDamages { get; set; } = new List<LossAndDamage>();
    }
}

