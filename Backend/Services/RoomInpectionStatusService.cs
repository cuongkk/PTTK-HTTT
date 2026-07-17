using Backend.Dtos;
using Backend.Data;
using Backend.Models;
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
        // 1. Lấy hồ sơ đang chờ quản lý duyệt nhận phòng, kèm khách hàng, lịch xem phòng
        var applications = await _db.RentalApplications
            .Include(a => a.Customer)
            .Include(a => a.DepositSlips)
            .Include(a => a.RoomViewingSchedules)
                .ThenInclude(s => s.Rooms)   // chỉ có RoomId, ScheduleId, không include sâu hơn được
            .Where(a => a.Status == "cho_quan_ly_xac_nhan_coc")
            .ToListAsync();

        // 2. Gom hết RoomId cần thiết, query Room riêng 1 lần
        var roomIds = applications
            .SelectMany(a => a.RoomViewingSchedules.SelectMany(s => s.Rooms.Select(sr => sr.RoomId)))
            .Distinct()
            .ToList();

        var rooms = await _db.Rooms
            .Include(r => r.Branch)
            .Include(r => r.Beds)
            .Where(r => roomIds.Contains(r.RoomId))
            .ToListAsync();

        var roomLookup = rooms.ToDictionary(r => r.RoomId, r => r);

        // 3. Build DTO
        var result = new List<RoomStatusDto>();

        foreach (var app in applications)
        {
            var roomId = app.RoomViewingSchedules
                .SelectMany(s => s.Rooms)
                .Select(sr => sr.RoomId)
                .FirstOrDefault();

            var room = roomId is null ? null : roomLookup.GetValueOrDefault(roomId);
            if (room is null)
                continue;

            if (!string.IsNullOrEmpty(filter.BranchId) && room.BranchId != filter.BranchId)
                continue;

            result.Add(new RoomStatusDto
            {
                Id = room.RoomId,
                Name = room.RoomName,
                Building = room.Branch?.BranchName ?? room.BranchId,
                Condition = MapCondition(room.Status),
                AvailableBedsCount = room.Beds.Count(b => b.Status.Trim().ToLower() == "trong"),
                CustomerName = app.Customer?.FullName ?? "",
                ApplicationId = app.ApplicationId,
            });
        }

        // 3. Lọc thêm theo Condition nếu FE truyền lên.
        if (!string.IsNullOrEmpty(filter.Status))
        {
            result = result.Where(r => r.Condition == filter.Status).ToList();
        }

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

    public async Task<ReviewRoomStatusResultDto> ReviewRoomStatusAsync(string applicationId, bool isApproved)
    {
        var application = await _db.RentalApplications
            .FirstOrDefaultAsync(a => a.ApplicationId == applicationId);

        if (application == null)
            throw new KeyNotFoundException("Không tìm thấy hồ sơ đăng ký.");

        if (isApproved)
        {
            application.Status = "cho_khach_xac_nhan_dieu_kien_coc";
            await _db.SaveChangesAsync();
        }

        return new ReviewRoomStatusResultDto
        {
            RoomId = application.DesiredRoomId ?? "",
            NewStatus = application.Status
        };
    }
}
