namespace backend.DTOs
{
    public class UserUpdateDTO
    {
        public int Id { get; set; }
        public int? RoleId { get; set; }
        public int? MembershipId { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? GoogleId { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public bool? Status { get; set; }
        public string? Password { get; set; }
    }
}