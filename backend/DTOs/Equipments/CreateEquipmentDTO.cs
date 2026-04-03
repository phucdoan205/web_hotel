using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Equipment
{
    public class CreateEquipmentDTO
    {
        [Required(ErrorMessage = "Mã thiết bị là bắt buộc")]
        [StringLength(50, ErrorMessage = "Mã thiết bị tối đa 50 ký tự")]
        public string ItemCode { get; set; } = null!;

        [Required(ErrorMessage = "Tên thiết bị là bắt buộc")]
        [StringLength(255, ErrorMessage = "Tên thiết bị tối đa 255 ký tự")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "Danh mục là bắt buộc")]
        [StringLength(100, ErrorMessage = "Danh mục tối đa 100 ký tự")]
        public string Category { get; set; } = null!;

        [Required(ErrorMessage = "Đơn vị là bắt buộc")]
        [StringLength(50, ErrorMessage = "Đơn vị tối đa 50 ký tự")]
        public string Unit { get; set; } = null!;

        [Range(0, int.MaxValue, ErrorMessage = "Tổng số lượng không được âm")]
        public int TotalQuantity { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Giá gốc không được âm")]
        public decimal BasePrice { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Giá mặc định khi mất không được âm")]
        public decimal DefaultPriceIfLost { get; set; }

        [StringLength(255, ErrorMessage = "Nhà cung cấp tối đa 255 ký tự")]
        public string? Supplier { get; set; }

        public string? ImageUrl { get; set; }
    }
}