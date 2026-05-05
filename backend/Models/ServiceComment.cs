using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("ServiceComments")]
    public class ServiceComment
    {
        public int Id { get; set; }
        public int ServiceId { get; set; }
        public int UserId { get; set; }
        public int? ParentCommentId { get; set; }
        public int? TaggedUserId { get; set; }
        public string Content { get; set; } = null!;
        public int? Rating { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public Service Service { get; set; } = null!;
        public User User { get; set; } = null!;
        public User? TaggedUser { get; set; }
        public ServiceComment? ParentComment { get; set; }
        public ICollection<ServiceComment> Replies { get; set; } = new List<ServiceComment>();
    }
}
