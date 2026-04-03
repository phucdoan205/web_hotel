namespace backend.DTOs
{
    public class UserCreateDTO
    {
        public int? RoleId { get; set; }
        public int? MembershipId { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public string? GoogleId { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public bool? Status { get; set; }
        public string Password { get; set; } = null!;
    }
}