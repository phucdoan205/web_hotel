using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    
    public class User
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("role_id")]
        public int? RoleId { get; set; }

        [Column("membership_id")]
        public int? MembershipId { get; set; }

        [Column("full_name")]
        public string FullName { get; set; } = null!;

        [Column("email")]
        public string Email { get; set; } = null!;

        [Column("phone")]
        public string? Phone { get; set; }

        public string? GoogleId { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime? DateOfBirth { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("password_hash")]
        public string PasswordHash { get; set; } = null!;

        [Column("status")]
        public bool? Status { get; set; }
        public Role? Role { get; set; }
        public Membership? Membership { get; set; }
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<Article> Articles { get; set; } = new List<Article>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public decimal TotalSpending { get; set; } = 0;

        [Column("is_blacklisted")]
        public bool IsBlacklisted { get; set; } = false;
    }
}
