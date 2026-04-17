namespace backend.DTOs
{
    public class BookingDetailResponseDTO
    {
        public int Id { get; set; }
        public int? RoomId { get; set; }
        public string? RoomNumber { get; set; }
        public int? RoomTypeId { get; set; }
        public string? RoomTypeName { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public decimal PricePerNight { get; set; }
        public string? Status { get; set; }
        public string? GuestName { get; set; }
        public int? GuestId { get; set; }
    }
}