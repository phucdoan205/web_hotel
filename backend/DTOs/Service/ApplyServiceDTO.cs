namespace backend.DTOs.Service
{
    public class ApplyServiceItemDTO
    {
        public int ServiceId { get; set; }
        public int Quantity { get; set; }
    }

    public class ApplyServiceDTO
    {
        public int? BookingDetailId { get; set; }
        public int? ServiceId { get; set; }
        public int Quantity { get; set; }
        public bool IsPaid { get; set; }
        public int? VoucherId { get; set; }
        public System.Collections.Generic.List<ApplyServiceItemDTO>? Items { get; set; }
    }
}
