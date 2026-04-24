namespace backend.DTOs.Review
{
    public class UserReviewResponseDTO
    {
        public int Id { get; set; }
        public int? RoomTypeId { get; set; }
        public string RoomTypeName { get; set; } = string.Empty;
        public string? RoomImageUrl { get; set; }
        public DateTime? StayDate { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime? CreatedAt { get; set; }
        public bool Status { get; set; }
    }
}
