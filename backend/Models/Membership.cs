using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Memberships")]
    public class Membership
    {
        
        public int Id { get; set; }

        
        public string TierName { get; set; } = null!;

       
        public int? MinPoints { get; set; }

       
        public decimal? DiscountPercent { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();
    }
}

