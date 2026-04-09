namespace backend.DTOs.Housekeeping
{
    public class HousekeepingLossDamageReportItemDTO
    {
        public int Id { get; set; }
        public int RoomInventoryId { get; set; }
        public int? RoomId { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public int? EquipmentId { get; set; }
        public string EquipmentName { get; set; } = string.Empty;
        public string? EquipmentCode { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPenalty { get; set; }
        public decimal PenaltyAmount { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string ResolutionType { get; set; } = "Pending";
        public int? ResolvedQuantity { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }
}
