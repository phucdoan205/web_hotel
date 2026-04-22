namespace backend.DTOs.Payment
{
    public class MomoCreatePaymentRequestDTO
    {
        public int? BookingDetailId { get; set; }
        public long Amount { get; set; }
        public string? OrderInfo { get; set; }
    }
}
