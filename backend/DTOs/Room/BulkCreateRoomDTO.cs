namespace backend.DTOs.Room
{
    public class BulkCreateRoomDTO
    {
        public List<CreateRoomDTO> Rooms { get; set; } = new List<CreateRoomDTO>();
    }
}
