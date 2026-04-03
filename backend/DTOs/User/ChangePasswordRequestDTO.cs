namespace backend.DTOs.User
{
    public class ChangePasswordRequestDTO
    {
        public int? UserId { get; set; }
        public string? CurrentPassword { get; set; }
        public string NewPassword { get; set; } = null!;
    }
}
