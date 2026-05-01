namespace backend.DTOs.RoomType
{
    public class RoomTypeDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public int CapacityAdults { get; set; }
        public int CapacityChildren { get; set; }
        public decimal? Size { get; set; }
        public string? BedType { get; set; }
        public string? Description { get; set; }
        public string? PrimaryImageUrl { get; set; }
        public int RoomCount { get; set; }
        public double Rating { get; set; }
        public int ReviewCount { get; set; }
    }
}

