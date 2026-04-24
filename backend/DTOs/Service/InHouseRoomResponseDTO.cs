namespace backend.DTOs.Service
{
    public class InHouseRoomResponseDTO
    {
        public int BookingId { get; set; }
        public int BookingDetailId { get; set; }
        public string BookingCode { get; set; } = string.Empty;
        public string RoomNumber { get; set; } = string.Empty;
        public string RoomName { get; set; } = string.Empty;
        public string GuestName { get; set; } = string.Empty;
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public string BookingStatus { get; set; } = string.Empty;
        public string DetailStatus { get; set; } = string.Empty;
    }
}
