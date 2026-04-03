namespace backend.DTOs
{
    public class ArticleDTO
    {
        public int Id { get; set; }
        public int? CategoryId { get; set; }
        public int? AuthorId { get; set; }
        public string Title { get; set; } = null!;
        public string? Slug { get; set; }
        public string? Content { get; set; }
        public string? ThumbnailUrl { get; set; }
        public DateTime? PublishedAt { get; set; }
        public bool Status { get; set; }
    }
}