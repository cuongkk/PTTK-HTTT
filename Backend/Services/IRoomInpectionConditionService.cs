using Backend.Dtos;

namespace Backend.Services;

public interface IRoomInpectionConditionService
{
    Task<List<RoomConditionDto>> GetRoomConditionsAsync();
    


}