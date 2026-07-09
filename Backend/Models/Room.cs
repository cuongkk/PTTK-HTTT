namespace Backend.Models;

public static class RoomType
{
    public const string Whole = "nguyen_can";
    public const string Shared = "ghep";
}

public static class RoomBedStatus
{
    public const string Empty = "trong";
    public const string Deposited = "da_dat_coc";
    public const string Rented = "dang_thue";
    public const string Maintenance = "bao_tri";
}

public class Room
{
    public string RoomId { get; set; } = default!;
    public string BranchId { get; set; } = default!;
    public string RoomName { get; set; } = default!;
    public string RoomType { get; set; } = default!;
    public short Capacity { get; set; }
    public string? Area { get; set; }
    public decimal? RoomPrice { get; set; }
    public bool HasAirConditioner { get; set; }
    public bool HasParking { get; set; }
    public string Status { get; set; } = RoomBedStatus.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByAccountId { get; set; }

    public Branch Branch { get; set; } = default!;
    public Account? UpdatedByAccount { get; set; }
    public ICollection<Bed> Beds { get; set; } = new List<Bed>();
}
