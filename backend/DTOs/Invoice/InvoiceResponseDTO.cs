namespace backend.DTOs.Invoice
{
    public class InvoiceResponseDTO
    {
        public int Id { get; set; }
        public int? BookingId { get; set; }
        public int? BookingDetailId { get; set; }
        public int? VoucherId { get; set; }
        public string? Code { get; set; }
        public string? BookingCode { get; set; }
        public string? GuestName { get; set; }
        public string? RoomNumber { get; set; }
        public string? RoomName { get; set; }
        public decimal? RoomRate { get; set; }
        public DateTime? CheckInDate { get; set; }
        public DateTime? CheckOutDate { get; set; }
        public int? StayedDays { get; set; }
        public decimal? TotalRoomAmount { get; set; }
        public decimal? TotalServiceAmount { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? TaxAmount { get; set; }
        public decimal? FinalTotal { get; set; }
        public string? Status { get; set; }
        public string? Notes { get; set; }
        public string? VoucherCode { get; set; }
        public string? VoucherDiscountType { get; set; }
        public decimal? VoucherDiscountValue { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? PaidAt { get; set; }
    }
}
