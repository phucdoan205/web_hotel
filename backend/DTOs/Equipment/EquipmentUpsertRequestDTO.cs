using Microsoft.AspNetCore.Http;

namespace backend.DTOs.Equipment
{
    public class EquipmentUpsertRequestDTO
    {
        public string ItemCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public int TotalQuantity { get; set; }
        public int InUseQuantity { get; set; }
        public int DamagedQuantity { get; set; }
        public int LiquidatedQuantity { get; set; }
        public decimal BasePrice { get; set; }
        public decimal DefaultPriceIfLost { get; set; }
        public string? Supplier { get; set; }
        public bool IsActive { get; set; } = true;
        public IFormFile? ImageFile { get; set; }
    }
}
