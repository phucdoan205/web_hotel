namespace backend.DTOs.User
{
    public class UserManagementResponseDTO
    {
        public int Id { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int? RoleId { get; set; }
        public string? RoleName { get; set; }
        public bool? Status { get; set; }
    }
}
