namespace backend.DTOs.Review
{
    public class UserReviewCreateDTO
    {
        public int? RoomTypeId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }
}
