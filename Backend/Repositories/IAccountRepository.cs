using Backend.Models;

namespace Backend.Repositories;

public interface IAccountRepository : IRepository<Account>
{
    Task<Account?> GetByUsernameAsync(string username);
    Task<Account?> GetByIdWithDetailsAsync(string accountId);
    Task<List<Account>> GetAllWithDetailsAsync();
    Task<bool> UsernameExistsAsync(string username);
}
