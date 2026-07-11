using Backend.Models;

namespace Backend.Repositories;

public interface ISystemParameterRepository : IRepository<SystemParameter>
{
    Task<List<SystemParameter>> GetByGroupAsync(string group);
}
