namespace backend.DTOs.Service
{
    public class ServiceCategoryResponseDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? IconUrl { get; set; }
        public bool Status { get; set; }
    }
}
