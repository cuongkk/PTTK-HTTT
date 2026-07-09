using System.Text.Json;
using Backend.Common;
using Backend.Dtos;
using Backend.Models;
using Backend.Repositories;
using Backend.Utilities;
using ServiceEntity = Backend.Models.Service;

namespace Backend.Services;

public class ServiceCatalogService : IServiceCatalogService
{
    private readonly IServiceRepository _serviceRepository;
    private readonly IAdminAuditLogRepository _auditLogRepository;

    public ServiceCatalogService(IServiceRepository serviceRepository, IAdminAuditLogRepository auditLogRepository)
    {
        _serviceRepository = serviceRepository;
        _auditLogRepository = auditLogRepository;
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
        await LogAsync(actorAccountId, null, ToDto(service));
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

        var oldSnapshot = ToDto(service);

        service.ServiceName = request.ServiceName;
        service.ServiceType = request.ServiceType;
        service.Unit = request.Unit;
        service.UnitPrice = request.UnitPrice;
        service.Description = request.Description;
        service.IsActive = request.IsActive;
        service.UpdatedAt = DateTime.UtcNow;
        service.UpdatedByAccountId = actorAccountId;

        _serviceRepository.Update(service);
        await LogAsync(actorAccountId, oldSnapshot, service);
        await _serviceRepository.SaveChangesAsync();

        return ToDto(service);
    }

    public async Task DeleteAsync(string serviceId, string actorAccountId)
    {
        var service = await _serviceRepository.GetByIdAsync(serviceId)
            ?? throw new NotFoundException($"Không tìm thấy dịch vụ '{serviceId}'.");

        var oldSnapshot = ToDto(service);
        _serviceRepository.Remove(service);
        await LogAsync(actorAccountId, oldSnapshot, null);
        await _serviceRepository.SaveChangesAsync();
    }

    private async Task LogAsync(string actorAccountId, object? oldValue, object? newValue)
    {
        await _auditLogRepository.AddAsync(new AdminAuditLog
        {
            LogId = IdGenerator.Generate("NK", 12),
            ActorAccountId = actorAccountId,
            ActionType = AdminActionType.UpdateService,
            OldValue = oldValue is null ? null : JsonSerializer.Serialize(oldValue, AuditJsonOptions.Default),
            NewValue = newValue is null ? null : JsonSerializer.Serialize(newValue, AuditJsonOptions.Default),
        });
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
