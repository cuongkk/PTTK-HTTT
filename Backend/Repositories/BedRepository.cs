using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class BedRepository : Repository<Bed>, IBedRepository
{
    public BedRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<List<Bed>> GetByRoomIdAsync(string roomId) =>
        await DbSet.Where(b => b.RoomId == roomId).OrderBy(b => b.BedNumber).ToListAsync();
}
