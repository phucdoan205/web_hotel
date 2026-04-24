namespace backend.DTOs.Invoice
{
    public class UserBookingPaymentSummaryDTO
    {
        public int BookingId { get; set; }
        public string BookingCode { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public decimal TotalAmount { get; set; }
        public List<UserBookingPaymentInvoiceItemDTO> Items { get; set; } = new();
    }

    public class UserBookingPaymentInvoiceItemDTO
    {
        public int InvoiceId { get; set; }
        public int? BookingDetailId { get; set; }
        public string? InvoiceCode { get; set; }
        public string RoomName { get; set; } = string.Empty;
        public string RoomNumber { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Paying";
    }
}
