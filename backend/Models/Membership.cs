using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Memberships")]
    public class Membership
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("tier_name")]
        public string TierName { get; set; } = null!;

        [Column("min_points")]
        public int? MinPoints { get; set; }

        [Column("discount_percent")]
        public decimal? DiscountPercent { get; set; }

        public string? Description { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();
    }
}

