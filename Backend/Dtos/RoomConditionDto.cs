namespace Backend.Dtos;

public class RoomInspectionConditionDto
{
    public string RoomId { get; set; } = "";

    public string RoomName { get; set; } = "";

    public string Building { get; set; } = "";

    public string Status { get; set; } = "";

    public string? Tenant {get; set; }
}