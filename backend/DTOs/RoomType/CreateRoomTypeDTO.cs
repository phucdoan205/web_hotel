namespace backend.DTOs.RoomType
{
    public class CreateRoomTypeDTO
    {
        public string Name { get; set; } = null!;
        public decimal BasePrice { get; set; }
        public int CapacityAdults { get; set; }
        public int CapacityChildren { get; set; }
        public decimal? Size { get; set; }
        public string? BedType { get; set; }
        public string? Description { get; set; }

        public List<int>? AmenityIds { get; set; }
        public List<string>? ImageUrls { get; set; }
    }
}
