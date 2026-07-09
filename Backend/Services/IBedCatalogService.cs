using Backend.Dtos;

namespace Backend.Services;

public interface IBedCatalogService
{
    Task<List<BedDto>> GetByRoomIdAsync(string roomId);
    Task<BedDto> CreateAsync(CreateBedRequest request, string actorAccountId);
    Task<BedDto> UpdateAsync(string bedId, UpdateBedRequest request, string actorAccountId);
    Task DeleteAsync(string bedId, string actorAccountId);
}
