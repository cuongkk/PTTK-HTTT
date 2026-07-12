namespace Backend.Models;

public class RoomAmenity
{
    public string RoomId { get; set; } = default!;
    public string AmenityId { get; set; } = default!;
    public short Quantity { get; set; } = 1;
    public string? Note { get; set; }

    public Room Room { get; set; } = default!;
    public Amenity Amenity { get; set; } = default!;
}
