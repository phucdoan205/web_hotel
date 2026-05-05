namespace backend.DTOs.Service
{
    public class ServiceCategoryResponseDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public bool Status { get; set; }
    }
}
