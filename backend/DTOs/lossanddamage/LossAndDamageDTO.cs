namespace backend.DTOs.LossAndDamage
{
    public class LossAndDamageRequestDTO
    {
        public int? BookingDetailId { get; set; }
        public int RoomInventoryId { get; set; }
        public int Quantity { get; set; }
        public decimal PenaltyAmount { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class LossAndDamageResponseDTO
    {
        public int Id { get; set; }
        public int? BookingDetailId { get; set; }
        public int RoomInventoryId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal PenaltyAmount { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public bool Status { get; set; }
        public int DecisionStatus { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
    }
}

