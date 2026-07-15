// Backend/Services/IDepositConfirmationService.cs
using Backend.Dtos;

namespace Backend.Services;

public interface IDepositConfirmationService
{
    Task<List<DepositConfirmationDto>> GetDepositConfirmationsAsync();

    Task<string> ReviewDepositAsync(string depositId, bool isApproved);
}