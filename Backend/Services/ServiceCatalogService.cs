using Backend.Common;
using Backend.Dtos;
using Backend.Repositories;
using Backend.Utilities;
using ServiceEntity = Backend.Models.Service;

namespace Backend.Services;

public class ServiceCatalogService : IServiceCatalogService
{
    private readonly IServiceRepository _serviceRepository;

    public ServiceCatalogService(IServiceRepository serviceRepository)
    {
        _serviceRepository = serviceRepository;
    }

    public async Task<List<ServiceDto>> GetAllAsync()
    {
        var services = await _serviceRepository.GetAllAsync();
        return services.Select(ToDto).ToList();
    }

    public async Task<ServiceDto> CreateAsync(CreateServiceRequest request, string actorAccountId)
    {
        if (await _serviceRepository.NameExistsAsync(request.ServiceName))
        {
            throw new ConflictException($"Dịch vụ '{request.ServiceName}' đã tồn tại.");
        }

        var service = new ServiceEntity
        {
            ServiceId = IdGenerator.Generate("DV", 12),
            ServiceName = request.ServiceName,
            ServiceType = request.ServiceType,
            Unit = request.Unit,
            UnitPrice = request.UnitPrice,
            Description = request.Description,
            IsActive = true,
            UpdatedAt = DateTime.UtcNow,
            UpdatedByAccountId = actorAccountId,
        };

        await _serviceRepository.AddAsync(service);
        await _serviceRepository.SaveChangesAsync();

        return ToDto(service);
    }

    public async Task<ServiceDto> UpdateAsync(string serviceId, UpdateServiceRequest request, string actorAccountId)
    {
        var service = await _serviceRepository.GetByIdAsync(serviceId)
            ?? throw new NotFoundException($"Không tìm thấy dịch vụ '{serviceId}'.");

        if (await _serviceRepository.NameExistsAsync(request.ServiceName, serviceId))
        {
            throw new ConflictException($"Dịch vụ '{request.ServiceName}' đã tồn tại.");
        }

        service.ServiceName = request.ServiceName;
        service.ServiceType = request.ServiceType;
        service.Unit = request.Unit;
        service.UnitPrice = request.UnitPrice;
        service.Description = request.Description;
        service.IsActive = request.IsActive;
        service.UpdatedAt = DateTime.UtcNow;
        service.UpdatedByAccountId = actorAccountId;

        _serviceRepository.Update(service);
        await _serviceRepository.SaveChangesAsync();

        return ToDto(service);
    }

    public async Task DeleteAsync(string serviceId, string actorAccountId)
    {
        var service = await _serviceRepository.GetByIdAsync(serviceId)
            ?? throw new NotFoundException($"Không tìm thấy dịch vụ '{serviceId}'.");

        _serviceRepository.Remove(service);
        await _serviceRepository.SaveChangesAsync();
    }

    private static ServiceDto ToDto(ServiceEntity service) => new(
        service.ServiceId,
        service.ServiceName,
        service.ServiceType,
        service.Unit,
        service.UnitPrice,
        service.Description,
        service.IsActive
    );
}
