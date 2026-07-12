namespace Backend.Dtos;

public record BedDto(string BedId, string RoomId, short BedNumber, decimal MonthlyRent, string Status);

public record RoomImageDto(string RoomImageId, string ImageUrl, string? Description, short DisplayOrder, bool IsPrimary);

public record RoomAmenityDto(string AmenityId, string AmenityName, short Quantity, string? Note);

public record RoomDto(
    string RoomId,
    string BranchId,
    string BranchName,
    string RoomName,
    string RoomType,
    short Capacity,
    string? Area,
    decimal? RoomPrice,
    short? Floor,
    decimal? AreaSquareMeters,
    string? Description,
    string? AllowedGender,
    bool RequiresQuietLifestyle,
    TimeOnly? CurfewTime,
    bool HasAirConditioner,
    bool HasParking,
    string Status,
    List<BedDto> Beds,
    List<RoomImageDto> Images,
    List<RoomAmenityDto> Amenities
);

public record CreateRoomRequest(
    string BranchId,
    string RoomName,
    string RoomType,
    short Capacity,
    string? Area,
    decimal? RoomPrice,
    short? Floor,
    decimal? AreaSquareMeters,
    string? Description,
    string? AllowedGender,
    bool RequiresQuietLifestyle,
    TimeOnly? CurfewTime,
    bool HasAirConditioner,
    bool HasParking
);

public record UpdateRoomRequest(
    string RoomName,
    string RoomType,
    short Capacity,
    string? Area,
    decimal? RoomPrice,
    short? Floor,
    decimal? AreaSquareMeters,
    string? Description,
    string? AllowedGender,
    bool RequiresQuietLifestyle,
    TimeOnly? CurfewTime,
    bool HasAirConditioner,
    bool HasParking,
    string Status
);

public record CreateBedRequest(string RoomId, short BedNumber, decimal MonthlyRent);
public record UpdateBedRequest(short BedNumber, decimal MonthlyRent, string Status);
public record BranchDto(string BranchId, string BranchName, string Address, string? PhoneNumber, string? Email);
