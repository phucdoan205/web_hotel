namespace backend.DTOs.Service
{
    public class ServiceUsageResponseDTO
    {
        public int Id { get; set; }
        public int OrderServiceId { get; set; }
        public int? BookingId { get; set; }
        public int? BookingDetailId { get; set; }
        public string BookingCode { get; set; } = string.Empty;
        public string RoomNumber { get; set; } = string.Empty;
        public string RoomName { get; set; } = string.Empty;
        public string GuestName { get; set; } = string.Empty;
        public int ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LineTotal { get; set; }
        public DateTime? UsedAt { get; set; }
        public string PaymentStatus { get; set; } = "Unpaid";
    }
}
