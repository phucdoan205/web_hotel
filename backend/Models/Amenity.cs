using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Amenity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        // Navigation property
        public ICollection<RoomTypeAmenity> RoomTypeAmenities { get; set; } = new List<RoomTypeAmenity>();
    }
}