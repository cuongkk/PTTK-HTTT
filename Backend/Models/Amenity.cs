namespace Backend.Models;

public class Amenity
{
    public string AmenityId { get; set; } = default!;
    public string AmenityName { get; set; } = default!;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<RoomAmenity> RoomAmenities { get; set; } = new List<RoomAmenity>();
}
