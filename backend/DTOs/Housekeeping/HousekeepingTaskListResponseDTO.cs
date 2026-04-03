namespace backend.DTOs.Housekeeping
{
    public class HousekeepingTaskListResponseDTO
    {
        public List<HousekeepingTaskItemDTO> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PendingCount { get; set; }
        public int InProgressCount { get; set; }
        public int CompletedCount { get; set; }
    }
}
