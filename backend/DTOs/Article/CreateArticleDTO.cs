namespace backend.DTOs.Article
{
    public class CreateArticleDTO
    {
        public int? CategoryId { get; set; }
        public int? AuthorId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Slug { get; set; }
        public string? Content { get; set; }
        public string? ThumbnailUrl { get; set; }
        public DateTime? PublishedAt { get; set; }
        public bool Status { get; set; } = true;
    }
}
