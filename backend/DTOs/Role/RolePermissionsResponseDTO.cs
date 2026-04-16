namespace backend.DTOs.Role
{
    public class RolePermissionsResponseDTO
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; } = null!;
        public string? Description { get; set; }
        public List<int> PermissionIds { get; set; } = new();
    }
}
