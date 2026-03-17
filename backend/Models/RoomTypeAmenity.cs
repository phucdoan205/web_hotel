using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
   
    public class RoomTypeAmenity
    {
        public int RoomTypeId { get; set; }
        public int AmenityId { get; set; }
        public RoomType RoomType { get; set; } = null!;
        public Amenity Amenity { get; set; } = null!;
    }
}

