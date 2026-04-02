namespace backend.DTOs.RoomInventory
{
    public class CloneRoomInventoryDTO
    {
        /// <summary>
        /// ID của RoomInventory nguồn cần sao chép
        /// </summary>
        public int SourceInventoryId { get; set; }

        /// <summary>
        /// Phòng đích (nếu muốn clone sang phòng khác). 
        /// Nếu không truyền → clone trong cùng phòng
        /// </summary>
        public int? TargetRoomId { get; set; }

        /// <summary>
        /// Equipment mới (optional). Nếu không gửi → giữ nguyên equipment nguồn
        /// </summary>
        public int? NewEquipmentId { get; set; }

        /// <summary>
        /// Số lượng mới (optional). Nếu không gửi → giữ nguyên số lượng nguồn
        /// </summary>
        public int? NewQuantity { get; set; }

        /// <summary>
        /// Loại vật dụng mới (optional). Nếu không gửi → giữ nguyên item type nguồn
        /// </summary>
        public string? NewItemType { get; set; }

        /// <summary>
        /// Ghi chú mới (optional). Nếu không gửi → giữ nguyên note nguồn
        /// </summary>
        public string? NewNote { get; set; }
    }
}
