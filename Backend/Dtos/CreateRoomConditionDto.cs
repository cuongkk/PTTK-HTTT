namespace Backend.Dtos;

public class CreateRoomInspectionDto
{
    public string RoomId { get; set; } = string.Empty;
    public string OverallCondition { get; set; } = string.Empty;   
    public string Cleanliness { get; set; } = string.Empty;       
    public string? DamageNotes { get; set; }
    public decimal EstimatedCost { get; set; }
    public bool NeedMaintenance { get; set; }
}


public class RoomInspectionResultDto
{
    public int InspectionId { get; set; }
    public string RoomId { get; set; } = string.Empty;
    public DateTime InspectedAt { get; set; }
}