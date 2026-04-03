using backend.Models;

namespace backend.DTOs.Room
{
    public class UpdateRoomDTO
    {
        public int? ID { get; set; }
        public int? RoomTypeId { get; set; }
        public string? RoomNumber { get; set; }
        public int? Floor { get; set; }
        public string? Status { get; set; }
        public string? CleaningStatus { get; set; }
    }
}
