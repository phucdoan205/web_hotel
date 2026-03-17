using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
   
    public class Article
    {
       
        public int Id { get; set; }

        
        public int? CategoryId { get; set; }

        
        public int? AuthorId { get; set; }

        
        public string Title { get; set; } = null!;

        
        public string? Slug { get; set; }

       
        public string? Content { get; set; }

      
        public string? ThumbnailUrl { get; set; }

        
        public DateTime? PublishedAt { get; set; }
        public bool Status { get; set; } = true;

        public ArticleCategory? Category { get; set; }
        public User? Author { get; set; }
    }
}

