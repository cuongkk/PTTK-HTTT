using Backend.Dtos;

namespace Backend.Services;

public interface IServiceCatalogService
{
    Task<List<ServiceDto>> GetAllAsync();
    Task<ServiceDto> CreateAsync(CreateServiceRequest request, string actorAccountId);
    Task<ServiceDto> UpdateAsync(string serviceId, UpdateServiceRequest request, string actorAccountId);
    Task DeleteAsync(string serviceId, string actorAccountId);
}
