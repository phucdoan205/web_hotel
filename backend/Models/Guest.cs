using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Guests")]
    public class Guest
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
