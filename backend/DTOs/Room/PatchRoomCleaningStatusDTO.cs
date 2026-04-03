using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Room
{
    public class PatchRoomCleaningStatusDTO
    {
        [Required(ErrorMessage = "Trạng thái dọn phòng là bắt buộc")]
        public string CleaningStatus { get; set; } = null!;
    }
}
