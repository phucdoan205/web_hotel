namespace backend.DTOs.RoomType
{
    public class UpdateRoomTypeDTO
    {
        public string? Name { get; set; }
        public decimal? BasePrice { get; set; }
        public int? CapacityAdults { get; set; }
        public int? CapacityChildren { get; set; }
        public decimal? Size { get; set; }
        public string? BedType { get; set; }
        public string? Description { get; set; }
    }
}
