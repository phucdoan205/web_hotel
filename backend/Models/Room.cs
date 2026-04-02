using backend.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Rooms")]
    public class Room : ISoftDelete
    {
        public int Id { get; set; }

        [Column("room_type_id")]
        public int? RoomTypeId { get; set; }

        [Column("room_number")]
        public string RoomNumber { get; set; } = null!;

        [Column("floor")]
        public int? Floor { get; set; }

        [Column("status")]
        public string? Status { get; set; }

        [NotMapped]
        public string? CleaningStatus { get; set; }

        [Column("Is_Deleted")]
        public bool IsDeleted { get; set; } = false;

        [Column("Deleted_At")]
        public DateTime? DeletedAt { get; set; }

        public RoomType? RoomType { get; set; }
        public ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();
        public ICollection<RoomInventory> RoomInventory{ get; set; } = new List<RoomInventory>();

        [Column("Last_Cleaning_Updated_At")]
        public DateTime? LastCleaningUpdatedAt { get; set; }
    }
}
