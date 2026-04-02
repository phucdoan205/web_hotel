using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Room_Types")]
    public class RoomType
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("name")]
        public string Name { get; set; } = null!;

        [Column("base_price")]
        public decimal BasePrice { get; set; }

        [Column("capacity_adults")]
        public int CapacityAdults { get; set; }

        [Column("capacity_children")]
        public int CapacityChildren { get; set; }

        [NotMapped]
        public decimal? Size { get; set; }

        [NotMapped]
        public string? BedType { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("status")]
        public bool Status { get; set; } = true;

        [NotMapped]
        public bool IsDeleted { get; set; }

        [NotMapped]
        public DateTime? DeletedAt { get; set; }

        public ICollection<Room> Rooms { get; set; } = new List<Room>();

        [NotMapped]
        public ICollection<RoomTypeAmenity> RoomTypeAmenities { get; set; } = new List<RoomTypeAmenity>();

        [NotMapped]
        public ICollection<RoomImage> RoomImages { get; set; } = new List<RoomImage>();

        [NotMapped]
        public ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();

        [NotMapped]
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}

