using Backend.Data;
using Backend.Models;

namespace Backend.Repositories;

public class SystemRoleRepository : Repository<SystemRole>, ISystemRoleRepository
{
    public SystemRoleRepository(AppDbContext context) : base(context)
    {
    }
}
