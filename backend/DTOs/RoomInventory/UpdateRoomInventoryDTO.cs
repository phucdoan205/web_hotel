namespace backend.DTOs.RoomInventory
{
    public class UpdateRoomInventoryDTO
    {
        public int? EquipmentId { get; set; }
        public int? Quantity { get; set; }
        public decimal? PriceIfLost { get; set; }
        public string? ItemType { get; set; }
        public string? Note { get; set; }
        public bool? IsActive { get; set; }
    }
}
