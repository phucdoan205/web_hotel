namespace backend.DTOs.RoomInventory
{
    public class UpdateRoomInventoryDTO
    {
        public string? ItemName { get; set; }
        public int? Quantity { get; set; }
        public decimal? PriceIfLost { get; set; }
    }
}
