namespace backend.DTOs.Role
{
    public class RoleResponseDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int UserCount { get; set; }
    }
}
