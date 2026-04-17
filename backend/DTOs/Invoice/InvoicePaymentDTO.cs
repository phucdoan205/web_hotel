namespace backend.DTOs.Invoice
{
    public class InvoicePaymentDTO
    {
        public int? PaymentMethodId { get; set; }
        public string? TransactionCode { get; set; }
    }
}
