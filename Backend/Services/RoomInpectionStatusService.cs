using Backend.Dtos;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class RoomInspectionStatusService : IRoomInspectionStatusService  
{
    private readonly AppDbContext _db;

    public RoomInspectionStatusService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<RoomStatusDto>> GetRoomStatusesAsync(RoomStatusFilterRequest filter)
    {
        var query = _db.Rooms
            .Include(r => r.Branch)
            .Include(r => r.Beds)
            .Where(c => c.Status == "cho_quan_ly_xac_nhan_coc")
            .AsQueryable();

        if (!string.IsNullOrEmpty(filter.BranchId))
            query = query.Where(p => p.BranchId == filter.BranchId);

        var rooms = await query.ToListAsync();

        var contracts = await _db.RentalContracts
            .Include(c => c.Customer)
            .Where(c => c.RoomId != null)
            .ToListAsync();

        var contractByRoomId = contracts
            .GroupBy(c => c.RoomId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(c => c.StartDate).First());

        var result = rooms.Select(p =>
        {
            var contract = contractByRoomId.GetValueOrDefault(p.RoomId);
            return new RoomStatusDto
            {
                Id = p.RoomId,
                Name = p.RoomName,
                Building = p.Branch?.BranchName ?? p.BranchId,
                Condition = MapCondition(p.Status),
                AvailableBedsCount = p.Beds.Count(b => b.Status.Trim().ToLower() == "trong"),
                CustomerName = contract?.Customer?.FullName ?? null,
                ContractId = contract?.ContractId ?? null,
            };
        }).ToList();

        if (!string.IsNullOrEmpty(filter.Status))
            result = result.Where(r => r.Condition == filter.Status).ToList();

        return result;
    }


    private static string MapCondition(string? status) 
    {
        // 1. Nếu điều kiện trong DB bị rỗng hoặc null, trả về mặc định luôn, không cho chạy xuống dưới
        if (string.IsNullOrWhiteSpace(status)) 
        {
            return "Không xác định";
        }

        // 2. Chuyển hết về chữ thường và xóa khoảng trắng thừa để so khớp chính xác
        return status.Trim().ToLower() switch
        {
            "trong" => "Trống",
            "da_dat_coc" => "Đã được đặt cọc",
            "dang_thue" => "Đã được giữ chỗ",
            "bao_tri" => "Đang bảo trì", // <-- Cứu cánh cho lỗi 'bao_tri' hiện tại
            _ => $"Khác ({status})"      // <-- Bắt buộc phải có dòng gạch dưới này để bọc lót tất cả các chữ lạ khác, không bao giờ lo sập nữa!
        };
    }

    public async Task<ReviewRoomStatusResultDto> ReviewRoomStatusAsync(string roomId, bool isApproved)
    {
        var room = await _db.Rooms.FirstOrDefaultAsync(r => r.RoomId == roomId);
        if (room is null)
            throw new KeyNotFoundException("Không tìm thấy phòng.");

        if (isApproved)
        {
            room.Status = "cho_khach_thanh_toan_coc"; // TODO: đổi đúng tên enum member
            await _db.SaveChangesAsync();
        }
        // Nếu từ chối: không đổi gì, giữ nguyên trạng thái hiện tại

        return new ReviewRoomStatusResultDto
        {
            RoomId = room.RoomId,
            NewStatus = MapCondition(room.Status) // dùng lại hàm MapStatus đã có
        };
    }
}