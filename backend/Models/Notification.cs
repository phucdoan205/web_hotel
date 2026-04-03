namespace backend.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string? Type { get; set; }
        public string? ReferenceLink { get; set; }
        public bool IsRead { get; set; }
        public DateTime? CreatedAt { get; set; }
        public User? User { get; set; }
    }
}
