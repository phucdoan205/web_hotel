namespace backend.DTOs.Room
{
    public class RoomDTO
    {
        public int ID { get; set; }

        public int? RoomTypeId { get; set; }

        public string RoomNumber { get; set; } = string.Empty;

        public int? Floor {  get; set; }

        public bool? Status { get; set; } 


    }
}
