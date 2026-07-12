using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class RoomRepository : Repository<Room>, IRoomRepository
{
    public RoomRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<List<Room>> GetAllWithDetailsAsync() =>
        await DbSet
            .Include(r => r.Branch)
            .Include(r => r.Beds)
            .Include(r => r.Images)
            .Include(r => r.RoomAmenities).ThenInclude(ra => ra.Amenity)
            .OrderBy(r => r.RoomName)
            .ToListAsync();

    public async Task<Room?> GetByIdWithDetailsAsync(string roomId) =>
        await DbSet
            .Include(r => r.Branch)
            .Include(r => r.Beds)
            .Include(r => r.Images)
            .Include(r => r.RoomAmenities).ThenInclude(ra => ra.Amenity)
            .FirstOrDefaultAsync(r => r.RoomId == roomId);
}
