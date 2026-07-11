namespace Backend.Models;

public class Bed
{
    public string BedId { get; set; } = default!;
    public string RoomId { get; set; } = default!;
    public short BedNumber { get; set; }
    public decimal MonthlyRent { get; set; }
    public string Status { get; set; } = RoomBedStatus.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByAccountId { get; set; }

    public Room Room { get; set; } = default!;
    public Account? UpdatedByAccount { get; set; }
}
