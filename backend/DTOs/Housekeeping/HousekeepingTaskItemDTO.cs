namespace backend.DTOs.Housekeeping
{
    public class HousekeepingTaskItemDTO
    {
        public int RoomId { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public int? Floor { get; set; }
        public int? RoomTypeId { get; set; }
        public string RoomTypeName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string CleaningStatus { get; set; } = string.Empty;
        public int? AssignedUserId { get; set; }
        public bool IsAssignedToCurrentUser { get; set; }
        public bool IsLockedByOther { get; set; }
        public string Priority { get; set; } = string.Empty;
        public string TaskType { get; set; } = string.Empty;
        public int InventoryCount { get; set; }
        public string? PreviewImageUrl { get; set; }
        public DateTime? LastCleaningUpdatedAt { get; set; }
    }
}
