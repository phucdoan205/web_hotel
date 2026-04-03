namespace backend.DTOs.RoomInventory
{
    public class RoomInventoryDTO
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public int? EquipmentId { get; set; }
        public string? EquipmentCode { get; set; }
        public string? EquipmentName { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public int? Quantity { get; set; }
        public decimal? PriceIfLost { get; set; }
        public string? Note { get; set; }
        public bool IsActive { get; set; }
        public string? ItemType { get; set; }
        public string? RoomNumber { get; set; }
    }
}
