using Backend.Dtos;

namespace Backend.Services;

public interface ISystemParameterService
{
    Task<List<SystemParameterDto>> GetAllAsync();
    Task<SystemParameterDto> UpdateAsync(string parameterId, UpdateSystemParameterRequest request, string actorAccountId);
}
