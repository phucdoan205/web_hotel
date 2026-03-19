using backend.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Rooms")]
    public class Room : ISoftDelete
    {
        public int Id { get; set; }
        public int? RoomTypeId { get; set; }
        public string RoomNumber { get; set; } = null!;
        public int? Floor { get; set; }
        public string? Status { get; set; }
        public string? CleaningStatus { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        public RoomType? RoomType { get; set; }
        public ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();
        public ICollection<RoomInventory> RoomInventory{ get; set; } = new List<RoomInventory>();
        public DateTime? LastCleaningUpdatedAt { get; set; }
    }
}