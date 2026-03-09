using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    
    public class Booking
    {
       
        public int Id { get; set; }

        
        public int? UserId { get; set; }

        
        public string? GuestName { get; set; }

        
        public string? GuestPhone { get; set; }

      
        public string? GuestEmail { get; set; }

        
        public string BookingCode { get; set; } = null!;

       
        public int? VoucherId { get; set; }

                public string? Status { get; set; }

        public User? User { get; set; }
        public Voucher? Voucher { get; set; }

        public ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();
        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    }
}

