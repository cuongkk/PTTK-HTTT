namespace Backend.Dtos;

public class ReviewRoomStatusDto
{
    public bool IsApproved { get; set; }
}

public class ReviewRoomStatusResultDto
{
    public string RoomId { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
}