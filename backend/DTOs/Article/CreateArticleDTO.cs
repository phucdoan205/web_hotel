using Microsoft.AspNetCore.Http;

namespace backend.DTOs.Article
{
    public class CreateArticleDTO
    {
        public int? CategoryId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Summary { get; set; }
        public string? Content { get; set; }
        public string? Tags { get; set; }
        public string? ThumbnailUrl { get; set; }
        public IFormFile? ThumbnailFile { get; set; }
        public List<IFormFile>? ImageFiles { get; set; }
    }
}
