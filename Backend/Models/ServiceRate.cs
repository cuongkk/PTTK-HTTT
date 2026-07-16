namespace Backend.Models;

public class ServiceRate
{
    public string ServiceRateId { get; set; } = default!;
    public string ServiceId { get; set; } = default!;
    public string? BranchId { get; set; }
    public string? RoomId { get; set; }
    public decimal UnitPrice { get; set; }
    public bool IsActive { get; set; } = true;

    public Service Service { get; set; } = default!;
    public Branch? Branch { get; set; }
    public Room? Room { get; set; }
}
