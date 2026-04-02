using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Loss_And_Damages")]
    public class LossAndDamage
    {
        [Column("Id")]
        public int Id { get; set; }

        [Column("Booking_Detail_Id")]
        public int? BookingDetailId { get; set; }

        [Column("Room_Inventory_Id")]
        public int? RoomInventoryId { get; set; }

        [Column("Quantity")]
        public int Quantity { get; set; }

        [Column("Penalty_Amount")]
        public decimal PenaltyAmount { get; set; }

        [Column("Description")]
        public string? Description { get; set; }

        [Column("Image_Url")]
        public string? ImageUrl { get; set; }

        [Column("Created_At")]
        public DateTime? CreatedAt { get; set; }

        [Column("Status")]
        public bool Status { get; set; } = false;

        [Column("Decision_Status")]
        public int DecisionStatus { get; set; } = 0;

        [Column("Resolved_At")]
        public DateTime? ResolvedAt { get; set; }

        public BookingDetail? BookingDetail { get; set; }
        public RoomInventory? RoomInventory { get; set; }
    }
}

