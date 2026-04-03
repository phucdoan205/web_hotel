using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Equipment
{
    public class UpdateEquipmentDTO
    {
        public int Id { get; set; }

        [StringLength(50, ErrorMessage = "Mã thiết bị tối đa 50 ký tự")]
        public string? ItemCode { get; set; }

        [StringLength(255, ErrorMessage = "Tên thiết bị tối đa 255 ký tự")]
        public string? Name { get; set; }

        [StringLength(100, ErrorMessage = "Danh mục tối đa 100 ký tự")]
        public string? Category { get; set; }

        [StringLength(50, ErrorMessage = "Đơn vị tối đa 50 ký tự")]
        public string? Unit { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Tổng số lượng không được âm")]
        public int? TotalQuantity { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Giá gốc không được âm")]
        public decimal? BasePrice { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Giá mặc định khi mất không được âm")]
        public decimal? DefaultPriceIfLost { get; set; }

        [StringLength(255, ErrorMessage = "Nhà cung cấp tối đa 255 ký tự")]
        public string? Supplier { get; set; }

        public bool? IsActive { get; set; }

        public string? ImageUrl { get; set; }
    }
}