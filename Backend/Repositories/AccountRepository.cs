using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class AccountRepository : Repository<Account>, IAccountRepository
{
    public AccountRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<Account?> GetByUsernameAsync(string username) =>
        await DbSet
            .Include(a => a.Role)
            .Include(a => a.Employee)
            .Include(a => a.Customer)
            .FirstOrDefaultAsync(a => a.Username == username);

    public async Task<Account?> GetByIdWithDetailsAsync(string accountId) =>
        await DbSet
            .Include(a => a.Role)
            .Include(a => a.Employee)
            .Include(a => a.Customer)
            .FirstOrDefaultAsync(a => a.AccountId == accountId);

    public async Task<List<Account>> GetAllWithDetailsAsync() =>
        await DbSet
            .Include(a => a.Role)
            .Include(a => a.Employee)
            .Include(a => a.Customer)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

    public async Task<bool> UsernameExistsAsync(string username) =>
        await DbSet.AnyAsync(a => a.Username == username);
}
