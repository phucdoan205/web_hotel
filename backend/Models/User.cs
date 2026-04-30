using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    
    public class User
    {
        public int Id { get; set; }
        public int? RoleId { get; set; }
        public int? MembershipId { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public string? GoogleId { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string PasswordHash { get; set; } = null!;
        public int Points { get; set; } = 0;
        public bool? Status { get; set; }
        public Role? Role { get; set; }
        public Membership? Membership { get; set; }
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<Article> Articles { get; set; } = new List<Article>();
        public ICollection<ArticleComment> ArticleComments { get; set; } = new List<ArticleComment>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}
