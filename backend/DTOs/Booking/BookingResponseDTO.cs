namespace backend.DTOs
{
    public class BookingResponseDTO
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public int? GuestId { get; set; }
        public string BookingCode { get; set; } = null!;
        public int? VoucherId { get; set; }
        public string? Status { get; set; }
    }
}