namespace Backend.Dtos;

public class RoomStatusDto
{
    public string Id { get; set; }
    public string Name { get; set; } = default!;      
    public string Building { get; set; } = default!; 
    public int AvailableBedsCount { get; set; }
    public string Status { get; set; } = default!;   
}

public class RoomStatusFilterRequest
{
    public string? BranchId { get; set; }
    public string? Status { get; set; } //
}