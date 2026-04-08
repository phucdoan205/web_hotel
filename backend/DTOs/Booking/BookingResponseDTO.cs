namespace backend.DTOs
{
    public class BookingResponseDTO
    {
        public int Id { get; set; }
        public string BookingCode { get; set; } = null!;
        public int? UserId { get; set; }
        public int? GuestId { get; set; }
        public string? GuestName { get; set; }
        public string? GuestPhone { get; set; }
        public string? GuestEmail { get; set; }
        public int? VoucherId { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }

        public List<BookingDetailResponseDTO> BookingDetails { get; set; } = new();
    }
}