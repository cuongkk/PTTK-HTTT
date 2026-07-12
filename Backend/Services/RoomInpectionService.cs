using Backend.Dtos;
using Backend.Data;

namespace Backend.Services;

public class RoomInspectionService : IRoomInspectionService
{
    private readonly AppDbContext _db;

    public RoomInspectionService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<RoomStatusDto>> GetRoomStatusesAsync(RoomStatusFilterRequest filter)
    {
        var query = _db.Phongs.AsQueryable();

        if (!string.IsNullOrEmpty(filter.BranchId))
            query = query.Where(p => p.MaChiNhanh == filter.BranchId);

        var rooms = await query.ToListAsync();

        var result = rooms.Select(p => new RoomStatusDto
        {
            Id = p.Id,
            Name = p.TenPhong,
            Building = p.MaChiNhanh, 
            Status = MapStatus(p.TrangThai)
        }).ToList();

        if (!string.IsNullOrEmpty(filter.Status))
            result = result.Where(r => r.Status == filter.Status).ToList();

        return result;
    }

    private static string MapStatus(string trangThai) => trangThai switch
    {
        "trong" => "Available",
        "da_dat_coc" => "Deposited",
        "dang_thue" => "Reserved"
    };

    private static string MapTenant(string trangThai) => trangThai switch
    {
        "trong" => "Trống",
        "da_dat_coc" => "Đã được đặt cọc",
        "dang_thue" => "Đã được giữ chỗ"
    };
}