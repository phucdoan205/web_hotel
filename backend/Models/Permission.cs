using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Permissions")]
    public class Permission
    {
        public int Id { get; set; } 
        public string Name { get; set; } = null!;
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}

