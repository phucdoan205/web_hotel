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
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? Address { get; set; }
        public bool? IsActive { get; set; } = true;
    }
}

