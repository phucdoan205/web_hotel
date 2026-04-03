namespace backend.DTOs.Auth
{
    public class LoginDto
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? GoogleCredential { get; set; }
    }
}
