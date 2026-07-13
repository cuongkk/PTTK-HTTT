// Backend/Services/ITenantVerificationService.cs
using Backend.Dtos;

namespace Backend.Services;

public interface ITenantVerificationService
{
    Task<List<TenantVerificationDto>> GetTenantVerificationsAsync();
}