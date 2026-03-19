namespace backend.Common
{
    public static class RoomCleaningStatuses
    {
        public const string Dirty = "Dirty";       // cần dọn
        public const string InProgress = "InProgress";  // đang dọn
        public const string Clean = "Clean";       // đã dọn xong, chờ kiểm tra
        public const string Inspected = "Inspected";   // đã kiểm tra, sẵn sàng cho khách
        public const string Pickup = "Pickup";      // dọn nhẹ (không thay ga)

        public static bool IsValid(string? status)
        {
            if (string.IsNullOrWhiteSpace(status)) return false;
            return status.EqualsAnyIgnoreCase(
                Dirty, InProgress, Clean, Inspected, Pickup);
        }

        public static string[] GetAll() =>
            [Dirty, InProgress, Clean, Inspected, Pickup];
    }
}
