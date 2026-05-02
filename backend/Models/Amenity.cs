using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    
    public class Amenity
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? IconUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public ICollection<RoomTypeAmenity> RoomTypeAmenities { get; set; } = new List<RoomTypeAmenity>();
        public ICollection<RoomAmenity> RoomAmenities { get; set; } = new List<RoomAmenity>();
        public ICollection<AmenityDetail> AmenityDetails { get; set; } = new List<AmenityDetail>();
    }
}

