using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
   
    public class ServiceCategory
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public bool Status { get; set; } = true;
        public ICollection<Service> Services { get; set; } = new List<Service>();
    }
}

