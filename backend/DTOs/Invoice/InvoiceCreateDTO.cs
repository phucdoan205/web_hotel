namespace backend.DTOs.Invoice
{
    public class InvoiceCreateDTO
    {
        public int? BookingId { get; set; }
        public int? BookingDetailId { get; set; }
        public int? VoucherId { get; set; }
        public string? Notes { get; set; }
        public decimal? RoomRate { get; set; }
        public DateTime? CheckOutDate { get; set; }
        public int? StayedDays { get; set; }
        public decimal? TotalRoomAmount { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? FinalTotal { get; set; }
        public string? VoucherCode { get; set; }
        public string? VoucherDiscountType { get; set; }
        public decimal? VoucherDiscountValue { get; set; }
    }
}
