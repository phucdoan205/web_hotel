namespace backend.DTOs.Service
{
    public class ServiceResponseDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? Unit { get; set; }
        public bool Status { get; set; }
    }
}
