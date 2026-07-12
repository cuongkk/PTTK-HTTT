namespace Backend.Models;

public class RoomImage
{
    public string RoomImageId { get; set; } = default!;
    public string RoomId { get; set; } = default!;
    public string ImageUrl { get; set; } = default!;
    public string? Description { get; set; }
    public short DisplayOrder { get; set; }
    public bool IsPrimary { get; set; }

    public Room Room { get; set; } = default!;
}
