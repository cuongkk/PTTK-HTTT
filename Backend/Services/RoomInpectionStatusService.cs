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
        // 1. Lấy danh sách phòng
        var query = _db.Rooms
            .Include(r => r.Branch)
            .Include(r => r.Beds)
            .AsQueryable();


        // Lọc theo chi nhánh
        if (!string.IsNullOrEmpty(filter.BranchId))
        {
            query = query.Where(r => r.BranchId == filter.BranchId);
        }


        var rooms = await query.ToListAsync();

        var roomIds = rooms
            .Select(r => r.RoomId)
            .ToList();


        // 2. Lấy ApplicationId thông qua lịch xem phòng
        // RentalApplication -> RoomViewingSchedule -> Room
        var applicationsByRoomId = await _db.RentalApplications
            .Where(a =>
                a.Status == "cho_quan_ly_xac_nhan_coc")
            .SelectMany(a => a.RoomViewingSchedules
                .SelectMany(s => s.Rooms.Select(r => new
                {
                    r.RoomId,
                    a.ApplicationId
                })))
            .Where(x => roomIds.Contains(x.RoomId))
            .GroupBy(x => x.RoomId)
            .ToDictionaryAsync(
                g => g.Key,
                g => g.Select(x => x.ApplicationId).FirstOrDefault()
            );


        // 3. Lấy các giường đang có phiếu cọc chờ xử lý
        var bedIdsPendingDeposit = await _db.DepositSlips
            .Include(d => d.Application)
            .Where(d =>
                d.Application != null &&
                (
                    d.Application.Status == "cho_quan_ly_xac_nhan_coc" ||
                    d.Application.Status == "cho_khach_thanh_toan_coc" ||
                    d.Application.Status == "cho_ke_toan_xac_nhan_coc"
                ))
            .SelectMany(d => d.Beds.Select(b => b.BedId))
            .ToListAsync();



        // 4. Map sang DTO
        var result = rooms.Select(room =>
        {
            var applicationId =
                applicationsByRoomId.GetValueOrDefault(room.RoomId);


            bool hasPendingDeposit =
                room.Beds.Any(b =>
                    bedIdsPendingDeposit.Contains(b.BedId));


            return new RoomStatusDto
            {
                Id = room.RoomId,

                // lấy ApplicationId từ lịch xem phòng
                ApplicationId = applicationId,

                Name = room.RoomName,

                Building = room.Branch?.BranchName
                        ?? room.BranchId,

                Condition = MapCondition(room.Status),

                AvailableBedsCount = room.Beds.Count(b =>
                    b.Status.Trim().ToLower() == "trong"),

                // chưa có hợp đồng ở UC2
                CustomerName = null
            };

        }).ToList();



        // 5. Lọc trạng thái phòng nếu có
        if (!string.IsNullOrEmpty(filter.Status))
        {
            result = result
                .Where(r => r.Condition == filter.Status)
                .ToList();
        }

       // Chỉ giữ lại những phòng có ApplicationId (bất kể trạng thái phòng là gì)
        result = result.Where(r => r.ApplicationId != null).ToList();


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
            application.Status = "cho_khach_thanh_toan_coc";
            await _db.SaveChangesAsync();
        }

        return new ReviewRoomStatusResultDto
        {
            RoomId = application.DesiredRoomId ?? "",
            NewStatus = application.Status
        };
    }
}