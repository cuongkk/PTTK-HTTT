using Backend.Models;

namespace Backend.Repositories;

public interface IBedRepository : IRepository<Bed>
{
    Task<List<Bed>> GetByRoomIdAsync(string roomId);
}
