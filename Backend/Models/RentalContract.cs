namespace Backend.Models;

public static class RentalContractStatus
{
    public const string Pending = "cho_xac_nhan";
    public const string Active = "dang_hieu_luc";
    public const string Expired = "het_han";
    public const string Terminated = "da_thanh_ly";
    public const string Cancelled = "da_huy";
}

public class RentalContract
{
    public string RentalContractId { get; set; } = default!;

    public string RoomId { get; set; } = default!;

    public string CustomerId { get; set; } = default!;

    public string? BedId { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public decimal MonthlyRent { get; set; }

    public decimal DepositAmount { get; set; }

    public string Status { get; set; } = RentalContractStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public string? UpdatedByAccountId { get; set; }

    // Navigation Properties
    public Room Room { get; set; } = default!;

    public Customer Customer { get; set; } = default!;

    public Bed? Bed { get; set; }

    public Account? UpdatedByAccount { get; set; }
}