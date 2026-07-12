using Backend.Dtos;

namespace Backend.Services;

public interface IRoomInspectionStatusService
{
    Task<List<RoomStatusDto>> GetRoomStatusesAsync(RoomStatusFilterRequest filter);

    Task<bool> ConfirmRoomStatusAsync(string roomId);
}