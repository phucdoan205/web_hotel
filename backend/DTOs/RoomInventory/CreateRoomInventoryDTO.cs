using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.RoomInventory
{
    public class CreateRoomInventoryDTO
    {
        [Required]
        public int RoomId { get; set; }

        public int? EquipmentId { get; set; }

        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }

        [Range(0, double.MaxValue)]
        public decimal PriceIfLost { get; set; }

        [MaxLength(100)]
        public string? ItemType { get; set; }

        public string? Note { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
