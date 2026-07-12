using Backend.Dtos;

namespace Backend.Services;

public interface IRoomInspectionService
{
    Task<List<RoomStatusDto>> GetRoomStatusesAsync(RoomStatusFilterRequest filter);
}