using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    
    public class RoomType
    {
        
        public int Id { get; set; }

        
        public string Name { get; set; } = null!;

        
        public decimal BasePrice { get; set; }

       
        public int CapacityAdults { get; set; }

       
        public int CapacityChildren { get; set; }

        
        public string? Description { get; set; }

        public ICollection<Room> Rooms { get; set; } = new List<Room>();
        public ICollection<RoomTypeAmenity> RoomTypeAmenities { get; set; } = new List<RoomTypeAmenity>();
        public ICollection<RoomImage> RoomImages { get; set; } = new List<RoomImage>();
        public ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}

