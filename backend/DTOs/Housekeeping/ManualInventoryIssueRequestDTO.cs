using Microsoft.AspNetCore.Http;

namespace backend.DTOs.Housekeeping
{
    public class ManualInventoryIssueRequestDTO
    {
        public int RoomInventoryId { get; set; }
        public int Quantity { get; set; }
        public string? Description { get; set; }
        public IFormFile? ImageFile { get; set; }
    }
}
