using System.ComponentModel.DataAnnotations.Schema;
using backend.Common;

namespace backend.Models
{
    public class Voucher : ISoftDelete
    {
        public int Id { get; set; }
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string DiscountType { get; set; } = null!;
        public decimal DiscountValue { get; set; }
        public decimal? MinBookingValue { get; set; }
        public DateTime? ValidFrom { get; set; }
        public DateTime? ValidTo { get; set; }
        public int? UsageLimit { get; set; }
        public int UsageCount { get; set; }
        public string? Description { get; set; }
        public bool IsPrivate { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<UserVoucher> UserVouchers { get; set; } = new List<UserVoucher>();
    }
}

