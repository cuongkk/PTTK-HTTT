using Backend.Common;
using Backend.Dtos;
using Backend.Models;
using Backend.Repositories;

namespace Backend.Services;

public class SystemParameterService : ISystemParameterService
{
    private readonly ISystemParameterRepository _parameterRepository;

    public SystemParameterService(ISystemParameterRepository parameterRepository)
    {
        _parameterRepository = parameterRepository;
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

        parameter.Value = request.Value;
        parameter.UpdatedAt = DateTime.UtcNow;
        parameter.UpdatedByAccountId = actorAccountId;

        _parameterRepository.Update(parameter);
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
