using backend.DTOs.RoomInventory;

namespace backend.DTOs.Room
{
    public class CreateRoomDTO
    {
        public int? RoomTypeId { get; set; }
        public string RoomNumber { get; set; } = null!;
        public int? Floor { get; set; }
        public string? Status { get; set; } = "Available";

        public List<CreateRoomInventoryDTO>? InitialInventories { get; set; }
    }
}
