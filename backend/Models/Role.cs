using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
        public class Role
    {
        
        public int Id { get; set; }

        
        public string Name { get; set; } = null!;

        
        public string? Description { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}

