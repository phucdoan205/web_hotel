namespace backend.DTOs.Housekeeping
{
    public class ReportInventoryIssueResponseDTO
    {
        public int LossAndDamageId { get; set; }
        public int RoomInventoryId { get; set; }
        public int? EquipmentId { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public string EquipmentName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPenalty { get; set; }
        public decimal PenaltyAmount { get; set; }
        public int RemainingRoomQuantity { get; set; }
        public int EquipmentDamagedQuantity { get; set; }
        public int EquipmentInUseQuantity { get; set; }
        public int? EquipmentInStockQuantity { get; set; }
        public string? ImageUrl { get; set; }
    }
}
