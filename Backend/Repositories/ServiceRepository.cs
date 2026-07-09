using Backend.Data;
using Microsoft.EntityFrameworkCore;
using ServiceEntity = Backend.Models.Service;

namespace Backend.Repositories;

public class ServiceRepository : Repository<ServiceEntity>, IServiceRepository
{
    public ServiceRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<bool> NameExistsAsync(string name, string? excludeId = null) =>
        await DbSet.AnyAsync(s => s.ServiceName == name && (excludeId == null || s.ServiceId != excludeId));
}
