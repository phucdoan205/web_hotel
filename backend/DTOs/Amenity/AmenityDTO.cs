namespace backend.DTOs.Amenity
{
    public class AmenityDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? IconUrl { get; set; }
        public bool IsActive { get; set; }
    }
}
