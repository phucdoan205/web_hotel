namespace backend.Common
{
    public class RoomCleaningStatuses
    {
        public const string Dirty = "Dirty";       // cần dọn
        public const string InProgress = "InProgress";  // đang dọn
        public const string Clean = "Clean";       // đã dọn xong, chờ kiểm tra
        public const string Inspected = "Inspected";   // đã kiểm tra, sẵn sàng cho khách
        public const string Pickup = "Pickup";      // dọn nhẹ (không thay ga)
    }
}
