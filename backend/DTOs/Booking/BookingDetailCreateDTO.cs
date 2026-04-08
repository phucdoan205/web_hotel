namespace backend.DTOs
{
    public class BookingDetailCreateDTO
    {
        public int? RoomId { get; set; }
        public int? RoomTypeId { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
    }
}