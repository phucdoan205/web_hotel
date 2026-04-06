using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    
    public class Voucher
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("code")]
        public string Code { get; set; } = null!;

        [Column("discount_type")]
        public string DiscountType { get; set; } = null!;

        [Column("discount_value")]
        public decimal DiscountValue { get; set; }

        [Column("min_booking_value")]
        public decimal? MinBookingValue { get; set; }

        [Column("valid_from")]
        public DateTime? ValidFrom { get; set; }

        [Column("valid_to")]
        public DateTime? ValidTo { get; set; }

        [Column("usage_limit")]
        public int? UsageLimit { get; set; }

        public int UsageCount { get; set; }
        public bool IsActive { get; set; } = true;
        public int? UserId { get; set; }
        public User? User { get; set; }
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}

