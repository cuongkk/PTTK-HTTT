using System.Text.Json;
using Backend.Common;
using Backend.Dtos;
using Backend.Models;
using Backend.Repositories;
using Backend.Utilities;

namespace Backend.Services;

public class SystemParameterService : ISystemParameterService
{
    private readonly ISystemParameterRepository _parameterRepository;
    private readonly IAdminAuditLogRepository _auditLogRepository;

    public SystemParameterService(
        ISystemParameterRepository parameterRepository,
        IAdminAuditLogRepository auditLogRepository)
    {
        _parameterRepository = parameterRepository;
        _auditLogRepository = auditLogRepository;
    }

    public async Task<List<SystemParameterDto>> GetAllAsync()
    {
        var parameters = await _parameterRepository.GetAllAsync();
        return parameters.Select(ToDto).ToList();
    }

    public async Task<SystemParameterDto> UpdateAsync(string parameterId, UpdateSystemParameterRequest request, string actorAccountId)
    {
        var parameter = await _parameterRepository.GetByIdAsync(parameterId)
            ?? throw new NotFoundException($"Không tìm thấy thông số '{parameterId}'.");

        var oldValue = parameter.Value;
        parameter.Value = request.Value;
        parameter.UpdatedAt = DateTime.UtcNow;
        parameter.UpdatedByAccountId = actorAccountId;

        _parameterRepository.Update(parameter);

        await _auditLogRepository.AddAsync(new AdminAuditLog
        {
            LogId = IdGenerator.Generate("NK", 12),
            ActorAccountId = actorAccountId,
            ActionType = AdminActionType.UpdateSystemParameter,
            OldValue = JsonSerializer.Serialize(new { parameterId, value = oldValue }, AuditJsonOptions.Default),
            NewValue = JsonSerializer.Serialize(new { parameterId, value = request.Value }, AuditJsonOptions.Default),
        });

        await _parameterRepository.SaveChangesAsync();

        return ToDto(parameter);
    }

    private static SystemParameterDto ToDto(SystemParameter p) => new(
        p.ParameterId,
        p.ParameterName,
        p.ParameterGroup,
        p.Value,
        p.DataType,
        p.Description,
        p.IsActive,
        p.UpdatedAt
    );
}
