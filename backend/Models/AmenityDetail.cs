namespace backend.Models
{
    public class AmenityDetail
    {
        public int Id { get; set; }
        public string Content { get; set; } = null!;
        public int AmenityId { get; set; }
        public Amenity Amenity { get; set; } = null!;
    }
}
