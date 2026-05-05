using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Service
{
    public class ServiceCategoryUpsertDTO
    {
        [Required(ErrorMessage = "Tên nhóm dịch vụ là bắt buộc.")]
        [StringLength(255)]
        public string Name { get; set; } = null!;
        public string? IconUrl { get; set; }
        public bool Status { get; set; } = true;
    }
}
