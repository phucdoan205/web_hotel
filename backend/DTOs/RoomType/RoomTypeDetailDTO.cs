namespace backend.DTOs.RoomType
{
    public class RoomTypeDetailDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public int CapacityAdults { get; set; }
        public int CapacityChildren { get; set; }
        public decimal? Size { get; set; }
        public string? BedType { get; set; }
        public string? Description { get; set; }

        public List<string> Amenities { get; set; } = new();
        public List<string> ImageUrls { get; set; } = new();
        public int RoomCount { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
