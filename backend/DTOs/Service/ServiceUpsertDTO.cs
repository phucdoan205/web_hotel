namespace backend.DTOs.Service
{
    public class ServiceUpsertDTO
    {
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? Unit { get; set; }
        public bool Status { get; set; } = true;
    }
}
