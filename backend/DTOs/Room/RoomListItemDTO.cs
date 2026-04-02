namespace backend.DTOs.Room
{
    public class RoomListItemDTO
    {
        public int Id { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public string? Status { get; set; }
        public string RoomTypeName { get; set; } = string.Empty;
    }
}

