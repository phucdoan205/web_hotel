namespace backend.DTOs.Housekeeping
{
    public class InventoryShortageDetailDTO
    {
        public int? EquipmentId { get; set; }
        public string EquipmentName { get; set; } = string.Empty;
        public string? EquipmentCode { get; set; }
        public int RequestedQuantity { get; set; }
        public int AvailableQuantity { get; set; }
        public int ShortageQuantity { get; set; }
        public string? Note { get; set; }
    }
}
