using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("UserPaymentMethods")]
    public class UserPaymentMethod
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        
        public string MethodType { get; set; } = "Card"; // Card, E-Wallet, etc.
        public string Provider { get; set; } = null!; // Visa, MasterCard, Momo, etc.
        public string Last4Digits { get; set; } = null!;
        public string? ExpiryDate { get; set; } // MM/YY
        public string? CardHolderName { get; set; }
        public bool IsDefault { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
