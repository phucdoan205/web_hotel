using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    
    public class Amenity
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? IconUrl { get; set; }
        public bool IsActive { get; set; } = true; // Thêm trường IsActive để đánh dấu đã xóa
        public ICollection<RoomTypeAmenity> RoomTypeAmenities { get; set; } = new List<RoomTypeAmenity>();
    }
}

