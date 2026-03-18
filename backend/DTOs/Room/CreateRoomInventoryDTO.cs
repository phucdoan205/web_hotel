namespace backend.DTOs.Room
{
    public class CreateRoomInventoryDTO
    {
        public string ItemName { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal PriceIfLost { get; set; }
    }
}
