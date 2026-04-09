namespace backend.DTOs.Housekeeping
{
    public class HousekeepingInventoryReportResponseDTO
    {
        public List<HousekeepingShortageReportItemDTO> ShortageReports { get; set; } = new();
        public List<HousekeepingLossDamageReportItemDTO> LossDamageReports { get; set; } = new();
        public int ShortageReportCount { get; set; }
        public int ShortageUnitCount { get; set; }
        public int LossDamageReportCount { get; set; }
        public int LossDamageUnitCount { get; set; }
        public decimal TotalPenaltyAmount { get; set; }
    }
}
