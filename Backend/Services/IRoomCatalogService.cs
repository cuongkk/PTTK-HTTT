using Backend.Dtos;

namespace Backend.Services;

public interface IRoomCatalogService
{
    Task<List<RoomDto>> GetAllAsync();
    Task<RoomDto> CreateAsync(CreateRoomRequest request, string actorAccountId);
    Task<RoomDto> UpdateAsync(string roomId, UpdateRoomRequest request, string actorAccountId);
    Task DeleteAsync(string roomId, string actorAccountId);
    Task<List<BranchDto>> GetBranchesAsync();
}
