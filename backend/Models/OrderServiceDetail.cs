using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Order_Service_Details")]
    public class OrderServiceDetail
    {
       
        public int Id { get; set; }

        
        public int? OrderServiceId { get; set; }

     
        public int? ServiceId { get; set; }

    
        public int Quantity { get; set; }

        
        public decimal UnitPrice { get; set; }

        public OrderService? OrderService { get; set; }
        public Service? Service { get; set; }
    }
}

