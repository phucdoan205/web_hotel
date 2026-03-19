using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.RoomInventory
{
    public class CreateRoomInventoryDTO
    {
        [Required]
        public int RoomId { get; set; }

        [Required, MaxLength(100)]
        public string ItemName { get; set; } = null!;

        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }

        [Range(0, double.MaxValue)]
        public decimal PriceIfLost { get; set; }
    }
}
