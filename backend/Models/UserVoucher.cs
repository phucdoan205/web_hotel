using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class UserVoucher
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int VoucherId { get; set; }
        public DateTime SavedAt { get; set; } = DateTime.UtcNow;
        public bool IsUsed { get; set; } = false;
        public DateTime? UsedAt { get; set; }

        public User User { get; set; } = null!;
        public Voucher Voucher { get; set; } = null!;
    }
}
