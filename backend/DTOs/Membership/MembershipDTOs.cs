namespace backend.DTOs.Membership
{
    public class MembershipDTO
    {
        public int Id { get; set; }
        public string TierName { get; set; } = string.Empty;
        public int? MinPoints { get; set; }
        public decimal? DiscountPercent { get; set; }
        public string? Description { get; set; }
    }

    public class CreateMembershipDTO
    {
        public string TierName { get; set; } = string.Empty;
        public int? MinPoints { get; set; }
        public decimal? DiscountPercent { get; set; }
        public string? Description { get; set; }
    }
}
