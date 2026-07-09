using Backend.Models;

namespace Backend.Repositories;

public interface IRoomRepository : IRepository<Room>
{
    Task<List<Room>> GetAllWithDetailsAsync();
    Task<Room?> GetByIdWithDetailsAsync(string roomId);
}
