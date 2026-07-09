using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class SystemParameterRepository : Repository<SystemParameter>, ISystemParameterRepository
{
    public SystemParameterRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<List<SystemParameter>> GetByGroupAsync(string group) =>
        await DbSet.Where(p => p.ParameterGroup == group).ToListAsync();
}
