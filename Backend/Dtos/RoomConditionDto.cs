namespace Backend.Dtos;

public class RoomConditionDto
{
    public string RoomID { get; set; } = default!;
    public string RoomName { get; set; } = default!;
    public string Building { get; set; } = default!;
    public string Status { get; set; } = default!;
    public string Tenant { get; set; } = default!;
    public string? ContractId { get; set; }   
}
