using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class ServiceImage
    {
        public int Id { get; set; }
        public int ServiceId { get; set; }
        public string ImageUrl { get; set; } = null!;

        public Service? Service { get; set; }
    }
}
