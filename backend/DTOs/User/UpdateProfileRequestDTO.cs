namespace backend.DTOs.User
{
    public class UpdateProfileRequestDTO
    {
        public int? UserId { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
    }
}
