namespace backend.DTOs.Role
{
    public class MyPermissionsResponseDTO
    {
        public int UserId { get; set; }
        public int? RoleId { get; set; }
        public string? RoleName { get; set; }
        public List<PermissionResponseDTO> Permissions { get; set; } = new();
    }
}
