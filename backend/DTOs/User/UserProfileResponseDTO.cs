namespace backend.DTOs.User
{
    public class UserProfileResponseDTO
    {
        public int Id { get; set; }
        public int? RoleId { get; set; }
        public int? MembershipId { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public bool? Status { get; set; }
    }
}
