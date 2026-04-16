namespace backend.DTOs.Auth
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = null!;
        public int UserId { get; set; }
        public string FullName { get; set; } = null!;
        public string? Role { get; set; }
        public int? RoleId { get; set; }
        public string? GoogleId { get; set; }
        public string? Email { get; set; }
        public string? AvatarUrl { get; set; }
        public List<string> Permissions { get; set; } = new();
    }
}
