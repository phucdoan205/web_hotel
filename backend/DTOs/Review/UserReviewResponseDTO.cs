namespace backend.DTOs.Review
{
    public class UserReviewResponseDTO
    {
        public int Id { get; set; }
        public int? RoomTypeId { get; set; }
        public string RoomTypeName { get; set; } = string.Empty;
        public string? RoomImageUrl { get; set; }
        public DateTime? StayDate { get; set; }
        public double Rating { get; set; }
        public int? AmenitiesRating { get; set; }
        public int? StaffRating { get; set; }
        public int? CleanlinessRating { get; set; }
        public int? LocationRating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime? CreatedAt { get; set; }
        public bool Status { get; set; }
    }
}
