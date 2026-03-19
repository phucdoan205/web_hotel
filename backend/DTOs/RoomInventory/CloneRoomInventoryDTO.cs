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
        /// Tên mới (optional). Nếu không gửi → giữ nguyên tên nguồn
        /// </summary>
        public string? NewItemName { get; set; }

        /// <summary>
        /// Số lượng mới (optional). Nếu không gửi → giữ nguyên số lượng nguồn
        /// </summary>
        public int? NewQuantity { get; set; }
    }
}
