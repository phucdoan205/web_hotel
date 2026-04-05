namespace backend.DTOs
{
    public class BookingCreateDTO
    {
        public int? UserId { get; set; }
        public int GuestId { get; set; }
        public List<BookingDetailCreateDTO> BookingDetails { get; set; } = new();
    }
}