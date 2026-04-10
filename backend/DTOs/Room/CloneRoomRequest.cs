public class CloneRoomRequest
{
    public string NewRoomNumber { get; set; } = string.Empty;
    public int? Floor { get; set; }
    public string? CleaningStatus { get; set; } = "Dirty";
}
