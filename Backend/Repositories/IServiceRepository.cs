using ServiceEntity = Backend.Models.Service;

namespace Backend.Repositories;

public interface IServiceRepository : IRepository<ServiceEntity>
{
    Task<bool> NameExistsAsync(string name, string? excludeId = null);
}
