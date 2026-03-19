using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Article
    {
        [Key]
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Slug { get; set; } = null!; // Sinh ra để chạy API GET /api/Articles/{slug}
        public string Content { get; set; } = null!;
        public string? Thumbnail { get; set; } // Sinh ra để chạy API POST thumbnail

        public int ArticleCategoryId { get; set; }
        [ForeignKey("ArticleCategoryId")]
        public virtual ArticleCategory ArticleCategory { get; set; } = null!;
    }
}