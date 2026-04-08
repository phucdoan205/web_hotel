namespace backend.Models
{
    public class ArticleComment
    {
        public int Id { get; set; }
        public int ArticleId { get; set; }
        public int UserId { get; set; }
        public int? ParentCommentId { get; set; }
        public int? TaggedUserId { get; set; }
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public Article Article { get; set; } = null!;
        public User User { get; set; } = null!;
        public User? TaggedUser { get; set; }
        public ArticleComment? ParentComment { get; set; }
        public ICollection<ArticleComment> Replies { get; set; } = new List<ArticleComment>();
    }
}
