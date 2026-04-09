namespace backend.DTOs.Housekeeping
{
    public class HousekeepingShortageReportItemDTO
    {
        public int NotificationId { get; set; }
        public int RoomId { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public string? Reason { get; set; }
        public int? SourceRoomId { get; set; }
        public string? SourceRoomNumber { get; set; }
        public int? EquipmentId { get; set; }
        public string EquipmentName { get; set; } = string.Empty;
        public string? EquipmentCode { get; set; }
        public int RequestedQuantity { get; set; }
        public int AvailableQuantity { get; set; }
        public int ShortageQuantity { get; set; }
        public string? Note { get; set; }
        public List<InventoryShortageDetailDTO> ShortageDetails { get; set; } = new();
        public DateTime? CreatedAt { get; set; }
        public string ResolutionType { get; set; } = "Pending";
        public int? ResolvedQuantity { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }
}
