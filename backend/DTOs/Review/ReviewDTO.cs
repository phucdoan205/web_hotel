namespace backend.DTOs
{
    public class ReviewDTO
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public int? RoomTypeId { get; set; }
        public int? Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime? CreatedAt { get; set; }
        public bool Status { get; set; }
    }
}