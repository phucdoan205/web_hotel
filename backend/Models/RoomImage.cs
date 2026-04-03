using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
  
    public class RoomImage
    {
        public int Id { get; set; }
        public int? RoomTypeId { get; set; }
        public string ImageUrl { get; set; } = null!;
        public bool? IsPrimary { get; set; }
        public RoomType? RoomType { get; set; }
    }
}

