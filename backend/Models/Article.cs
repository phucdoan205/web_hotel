using System.ComponentModel.DataAnnotations.Schema;
using backend.Common;

namespace backend.Models
{
   
    public class Article : ISoftDelete
    {
        public int Id { get; set; }
        public int? CategoryId { get; set; }
        public int? AuthorId { get; set; }
        public string Title { get; set; } = null!;
        public string? Slug { get; set; }
        public string? Content { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? Summary { get; set; }
        public string? Tags { get; set; }
        public DateTime? PublishedAt { get; set; }
        public bool Status { get; set; } = false;
        public bool IsApproved { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public int? ApprovedById { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public ArticleCategory? Category { get; set; }
        public User? Author { get; set; }
        public User? ApprovedBy { get; set; }
        public ICollection<ArticleComment> Comments { get; set; } = new List<ArticleComment>();
    }
}

