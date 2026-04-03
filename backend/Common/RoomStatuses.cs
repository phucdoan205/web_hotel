namespace backend.Common
{
    public static class RoomStatuses
    {
        public const string Available = "Available";       // phòng trống
        public const string Occupied = "Occupied";  // đã lấy
        public const string Maintenance = "Maintenance";       // đang sửa chữa
        public const string Cleaning = "Cleaning";   // đang dọn phòng
        public const string OutOfOrder = "OutOfOrder";      // không hoạt động

        public static bool IsValid(string? status)
        {
            if (string.IsNullOrWhiteSpace(status)) return false;
            return status.EqualsAnyIgnoreCase(
                Available, Occupied, Maintenance, Cleaning, OutOfOrder);
        }

        public static string[] GetAll() =>
            [Available, Occupied, Maintenance, Cleaning, OutOfOrder];
    }
}
