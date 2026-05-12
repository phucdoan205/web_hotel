using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class AttractionImage
    {
        public int Id { get; set; }
        public int AttractionId { get; set; }
        public string ImageUrl { get; set; } = null!;
        
        [ForeignKey("AttractionId")]
        public Attraction? Attraction { get; set; }
    }
}
