namespace backend.DTOs.Attraction
{
    public class CreateAttractionDTO
    {
        public string Name { get; set; } = null!;
        public string? Category { get; set; }
        public decimal? DistanceKm { get; set; }
        public string? Description { get; set; }
        public string? MapEmbedLink { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? Address { get; set; }
        public bool IsActive { get; set; } = true;
        public string? ImageUrl { get; set; }
    }
}
