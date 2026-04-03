namespace backend.DTOs
{
    public class PaymentDTO
    {
        public int Id { get; set; }
        public int? InvoiceId { get; set; }
        public int? PaymentMethodId { get; set; }
        public decimal AmountPaid { get; set; }
        public string? TransactionCode { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string? Status { get; set; }
    }
}