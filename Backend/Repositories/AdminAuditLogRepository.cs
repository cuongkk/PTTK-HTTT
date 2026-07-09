using Backend.Data;
using Backend.Models;

namespace Backend.Repositories;

public class AdminAuditLogRepository : Repository<AdminAuditLog>, IAdminAuditLogRepository
{
    public AdminAuditLogRepository(AppDbContext context) : base(context)
    {
    }
}
