using backend.DTOs;

namespace backend.DTOs.Voucher
{
    public class UserVoucherDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int VoucherId { get; set; }
        public DateTime SavedAt { get; set; }
        public bool IsUsed { get; set; }
        public VoucherDTO Voucher { get; set; } = null!;
    }
}
