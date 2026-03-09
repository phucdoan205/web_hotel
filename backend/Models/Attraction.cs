using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
   
    public class Attraction
    {
        
        public int Id { get; set; }

        
        public string Name { get; set; } = null!;

      
        public decimal? DistanceKm { get; set; }

       
        public string? Description { get; set; }

       
        public string? MapEmbedLink { get; set; }
    }
}

