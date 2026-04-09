using backend.DTOs.Housekeeping;

namespace backend.DTOs.RoomInventory
{
    public class CloneRoomInventoryResponseDTO
    {
        public int TargetRoomId { get; set; }
        public string TargetRoomNumber { get; set; } = string.Empty;
        public int ClonedItemCount { get; set; }
        public int ShortageItemCount { get; set; }
        public int? ShortageNotificationId { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<InventoryShortageDetailDTO> ShortageDetails { get; set; } = new();
    }
}
