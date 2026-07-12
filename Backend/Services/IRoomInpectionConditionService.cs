using Backend.Dtos;

namespace Backend.Services;

public interface IRoomInspectionConditionService
{
    Task<List<RoomInspectionConditionDto>> GetRoomInspectionConditionsAsync();
}