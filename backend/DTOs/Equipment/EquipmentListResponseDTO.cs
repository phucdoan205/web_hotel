namespace backend.DTOs.Equipment
{
    public class EquipmentListResponseDTO
    {
        public List<EquipmentListItemDTO> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public List<string> Categories { get; set; } = new();
        public EquipmentSummaryDTO Summary { get; set; } = new();
    }
}
