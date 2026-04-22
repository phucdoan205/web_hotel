namespace backend.DTOs.Payment
{
    public class MomoIpnResponseDTO
    {
        public string? OrderType { get; set; }
        public long Amount { get; set; }
        public string PartnerCode { get; set; } = string.Empty;
        public string RequestId { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
        public int ResultCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? OrderInfo { get; set; }
        public string? PayType { get; set; }
        public long? TransId { get; set; }
        public long ResponseTime { get; set; }
        public string? ExtraData { get; set; }
        public string? Signature { get; set; }
    }
}
