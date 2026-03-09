using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Order_Services")]
    public class OrderService
    {
        
        public int Id { get; set; }

        
        public int? BookingDetailId { get; set; }

      
        public DateTime? OrderDate { get; set; }

       
        public decimal? TotalAmount { get; set; }

      
        public string? Status { get; set; }

        public BookingDetail? BookingDetail { get; set; }
        public ICollection<OrderServiceDetail> OrderServiceDetails { get; set; } = new List<OrderServiceDetail>();
    }
}

