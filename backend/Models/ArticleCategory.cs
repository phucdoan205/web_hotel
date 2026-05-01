using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    
    public class ArticleCategory
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public bool Status { get; set; } = true;
        public ICollection<Article> Articles { get; set; } = new List<Article>();
    }
}

