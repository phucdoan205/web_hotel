namespace backend.DTOs.User
{
    public class UploadAvatarResponseDTO
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = null!;
        public string Folder { get; set; } = null!;
        public string Url { get; set; } = null!;
    }
}
