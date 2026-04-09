namespace backend.DTOs.Housekeeping
{
    public class ResolveInventoryReportRequestDTO
    {
        public string ReportType { get; set; } = string.Empty;
        public int ReportId { get; set; }
        public string ResolutionType { get; set; } = string.Empty;
        public int? Quantity { get; set; }
    }
}
