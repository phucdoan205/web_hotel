namespace backend.DTOs.UserBooking
{
    public class UserBookingCheckOutResponseDTO
    {
        public string Message { get; set; } = string.Empty;
        public int BookingId { get; set; }
        public string BookingStatus { get; set; } = "Paying";
        public List<int> InvoiceIds { get; set; } = new();
    }
}
