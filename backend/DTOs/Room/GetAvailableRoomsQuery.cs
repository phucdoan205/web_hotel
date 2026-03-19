namespace backend.DTOs.Room
{
    public class GetAvailableRoomsQuery
    {
        public DateTime? CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        public int? RoomTypeId { get; set; }
        public int? Adults { get; set; }
        public int? Children { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
