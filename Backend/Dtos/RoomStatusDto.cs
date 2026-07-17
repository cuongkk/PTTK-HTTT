namespace Backend.Dtos;

public class RoomStatusDto
{
    public string Id { get; set; } = default!;
    public string ContractId { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string Building { get; set; } = default!;
    public int AvailableBedsCount { get; set; }
    public string Condition { get; set; } = default!;
    public string? CustomerName { get; set; }
    public string? ApplicationId { get; set; }
    public int RequestedBedsCount { get; set; }
}

public class RoomStatusFilterRequest
{
    public string? BranchId { get; set; }
    public string? Status { get; set; } //
}
