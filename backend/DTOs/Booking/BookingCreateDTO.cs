namespace backend.DTOs
{
// DTOs/Booking/BookingCreateDTO.cs
public class BookingCreateDTO
{
    public int? UserId { get; set; }         
    public int? GuestId { get; set; }  

    // Nếu GuestId = null hoặc không tồn tại → tạo Guest mới từ các trường này
    public string? GuestName { get; set; }
    public string? GuestPhone { get; set; }
    public string? GuestEmail { get; set; }

    public int? VoucherId { get; set; }

    public List<BookingDetailCreateDTO> BookingDetails { get; set; } = new();
}
}