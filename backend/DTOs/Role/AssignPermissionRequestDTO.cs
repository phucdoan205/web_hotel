namespace backend.DTOs.Role
{
    public class AssignPermissionRequestDTO
    {
        public int RoleId { get; set; }
        public List<int> PermissionIds { get; set; } = new();
    }
}
