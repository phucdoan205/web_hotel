namespace backend.DTOs
{
    public class ChangeRoomRequestDTO
{
    public int BookingDetailId { get; set; }
    public int? NewRoomId { get; set; }
    public int NewRoomTypeId { get; set; }
}
}