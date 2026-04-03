using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("PaymentMethods")]
    public class PaymentMethod
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }

        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
