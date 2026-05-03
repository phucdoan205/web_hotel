namespace backend.DTOs.Review
{
    public class UserReviewCreateDTO
    {
        public int? RoomTypeId { get; set; }
        public int? Rating { get; set; }
        public int? AmenitiesRating { get; set; }
        public int? StaffRating { get; set; }
        public int? CleanlinessRating { get; set; }
        public int? LocationRating { get; set; }
        public string? Comment { get; set; }
    }
}
