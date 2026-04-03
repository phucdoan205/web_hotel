using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Payments")]
    public class Payment
    {
        public int Id { get; set; }
        public int? InvoiceId { get; set; }
        public int? PaymentMethodId { get; set; }
        public decimal AmountPaid { get; set; }
        public string? TransactionCode { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string? Status { get; set; }

        public Invoice? Invoice { get; set; }
        public PaymentMethod? PaymentMethod { get; set; }
    }
}

