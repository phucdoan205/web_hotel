using backend.DTOs.RoomInventory;

namespace backend.DTOs.Room
{
    public class RoomDetailDTO
    {
        public int Id { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public int? Floor { get; set; }
        public string? Status { get; set; }  // Available, Occupied, Maintenance, Cleaning, OutOfOrder

        public int? RoomTypeId { get; set; }
        public string RoomTypeName { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public int CapacityAdults { get; set; }
        public int CapacityChildren { get; set; }
        public string? BedType { get; set; }
        public decimal? Size { get; set; }
        public string? CleaningStatus { get; set; }
        public DateTime? LastCleaningUpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }

        public List<string> Amenities { get; set; } = new();
        public List<string> ImageUrls { get; set; } = new();
        public List<RoomInventoryDTO> Inventory { get; set; } = new();
    }
}
