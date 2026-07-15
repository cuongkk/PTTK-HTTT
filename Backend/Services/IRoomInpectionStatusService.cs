using Backend.Dtos;

namespace Backend.Services;

public interface IRoomInspectionStatusService
{
    Task<List<RoomStatusDto>> GetRoomStatusesAsync(RoomStatusFilterRequest filter);

    Task<ReviewRoomStatusResultDto> ReviewRoomStatusAsync(string roomId, bool isApproved);
}