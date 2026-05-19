using System.Collections.Generic;

namespace backend.DTOs.Review
{
    public class ServiceReviewItem
    {
        public int ServiceId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }

    public class UserReviewCreateDTO
    {
        public int? RoomTypeId { get; set; }
        public int? Rating { get; set; }
        public int? AmenitiesRating { get; set; }
        public int? StaffRating { get; set; }
        public int? CleanlinessRating { get; set; }
        public int? LocationRating { get; set; }
        public string? Comment { get; set; }
        public int? BookingDetailId { get; set; }
        public List<ServiceReviewItem>? ServiceReviews { get; set; }
    }
}
