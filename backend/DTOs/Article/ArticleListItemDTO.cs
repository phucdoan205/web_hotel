namespace backend.DTOs.Article
{
    public class ArticleListItemDTO
    {
        public int Id { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public int? AuthorId { get; set; }
        public string? AuthorName { get; set; }
        public int? AttractionId { get; set; }
        public string? AttractionName { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Slug { get; set; }
        public string? Summary { get; set; }
        public string? ThumbnailUrl { get; set; }
        public List<string> GalleryUrls { get; set; } = new();
        public DateTime? PublishedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public bool Status { get; set; }
        public bool IsApproved { get; set; }
        public bool IsDeleted { get; set; }
        public int CommentCount { get; set; }
        public List<string> Tags { get; set; } = new();
    }
}
