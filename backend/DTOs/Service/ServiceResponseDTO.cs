namespace backend.DTOs.Service
{
    public class ServiceResponseDTO
    {
        public int Id { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? Unit { get; set; }
        public bool Status { get; set; }
        public List<string> Images { get; set; } = new List<string>();
        public double AverageRating { get; set; }
        public int CommentCount { get; set; }
        public List<backend.DTOs.Article.ArticleCommentDTO> Comments { get; set; } = new();
    }
}
