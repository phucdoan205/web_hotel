namespace backend.DTOs.Room
{
    public class RoomInventoryDTO
    {
        public int Id { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public int? Quantity { get; set; }
        public decimal? PriceIfLost { get; set; }
    }
}
