namespace backend.DTOs.Service
{
    public class ServiceUpsertDTO
    {
        public int? CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? Unit { get; set; }
        public bool Status { get; set; } = true;
        public List<string> Images { get; set; } = new List<string>();
    }
}
