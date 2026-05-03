namespace backend.DTOs.Article
{
    public class ArticleCommentDTO
    {
        public int Id { get; set; }
        public int ArticleId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? UserAvatarUrl { get; set; }
        public int? ParentCommentId { get; set; }
        public int? TaggedUserId { get; set; }
        public string? TaggedUserName { get; set; }
        public int? Rating { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<ArticleCommentDTO> Replies { get; set; } = new();
    }
}
