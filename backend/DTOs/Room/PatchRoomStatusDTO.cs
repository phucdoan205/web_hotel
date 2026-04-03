using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Room
{
    public class PatchRoomStatusDTO
    {
        [Required(ErrorMessage = "Trạng thái là bắt buộc")]
        public string Status { get; set; } = string.Empty;
    }
}
