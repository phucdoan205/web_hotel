namespace backend.DTOs.Article
{
    public class ArticleCommentCreateDTO
    {
        public int? ParentCommentId { get; set; }
        public int? TaggedUserId { get; set; }
        public int? Rating { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}
