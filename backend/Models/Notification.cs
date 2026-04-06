using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Notification
    {
        [Column("Id")]
        public int Id { get; set; }

        [Column("User_Id")]
        public int? UserId { get; set; }

        [Column("Title")]
        public string Title { get; set; } = null!;

        [Column("Content")]
        public string Content { get; set; } = null!;

        [Column("Type")]
        public string? Type { get; set; }

        [Column("Reference_Link")]
        public string? ReferenceLink { get; set; }

        [Column("Is_Read")]
        public bool IsRead { get; set; }

        [Column("Created_At")]
        public DateTime? CreatedAt { get; set; }
        public User? User { get; set; }
    }
}
