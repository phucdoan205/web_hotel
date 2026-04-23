namespace backend.DTOs.Auth
{
    public class RegisterDto
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Password { get; set; }
        public bool AgreeTerms { get; set; }
    }
}
