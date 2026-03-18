using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Reviews")]
    public class Review
    {
        
        public int Id { get; set; }
        public int? UserId { get; set; }
        public int? RoomTypeId { get; set; }
        public int? Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime? CreatedAt { get; set; }
        public bool? Status { get; set; } = true;
        public User? User { get; set; }
        public RoomType? RoomType { get; set; }
    }
}

