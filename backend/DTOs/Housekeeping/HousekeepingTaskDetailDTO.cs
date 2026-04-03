using backend.DTOs.RoomInventory;

namespace backend.DTOs.Housekeeping
{
    public class HousekeepingTaskDetailDTO
    {
        public int RoomId { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public int? Floor { get; set; }
        public string RoomTypeName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string CleaningStatus { get; set; } = string.Empty;
        public string TaskType { get; set; } = string.Empty;
        public string? PreviewImageUrl { get; set; }
        public DateTime? LastCleaningUpdatedAt { get; set; }
        public List<RoomInventoryDTO> Inventory { get; set; } = new();
    }
}
