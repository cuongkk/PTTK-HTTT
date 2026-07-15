using Backend.Dtos;

namespace Backend.Services;

public interface IUserService
{
    Task<List<UserListItemDto>> GetAllAsync();
    Task<UserDetailDto> GetByIdAsync(string accountId);
    Task<UserListItemDto> CreateAsync(CreateUserRequest request, string actorAccountId);
    Task<UserListItemDto> UpdateAsync(string accountId, UpdateUserRequest request, string actorAccountId);
    Task DeleteAsync(string accountId, string actorAccountId);
    Task<ResetPasswordResponse> ResetPasswordAsync(string accountId, string actorAccountId);
}
