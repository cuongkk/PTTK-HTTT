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
        // 1. Lấy hợp đồng thỏa điều kiện, kèm theo Deposit -> Beds -> Room, Customer, TenantMembers
        var contracts = await _db.RentalContracts
            .Include(c => c.Customer)
            .Include(c => c.TenantMembers)
            .Include(c => c.Deposit)
                .ThenInclude(d => d.Beds)
            .Include(c => c.CheckoutRequests)
            .Where(c => c.Status == "cho_kiem_tra_tra_phong"
                    && c.Deposit != null
                    && c.CheckoutRequests.Any(cr => cr.Status == "da_xac_nhan_lich"))
            .ToListAsync();

        // 2. Lấy Bed -> Room cho các giường liên quan tới Deposit của các hợp đồng trên
        var allBedIds = contracts
            .SelectMany(c => c.Deposit!.Beds.Select(b => b.BedId))
            .Distinct()
            .ToList();

        var beds = await _db.Beds
            .Include(b => b.Room)
                .ThenInclude(r => r.Branch)
            .Include(b => b.Room)
                .ThenInclude(r => r.Beds)
            .Where(b => allBedIds.Contains(b.BedId))
            .ToListAsync();

        var bedLookup = beds.ToDictionary(b => b.BedId, b => b);

        // 3. Lọc theo điều kiện phòng "dang_thue" và build DTO
        var result = new List<RoomStatusDto>();

        foreach (var contract in contracts)
        {
            var relatedBeds = contract.Deposit!.Beds
                .Select(db => bedLookup.GetValueOrDefault(db.BedId))
                .Where(b => b != null)
                .Select(b => b!)
                .ToList();

            var room = relatedBeds.FirstOrDefault()?.Room;

            if (room is null || room.Status != RoomBedStatus.Rented)
                continue;

            if (!string.IsNullOrEmpty(filter.BranchId) && room.BranchId != filter.BranchId)
                continue;

            var tenantName = contract.Customer?.FullName
                ?? contract.TenantMembers.FirstOrDefault(tm => tm.IsPrimaryTenant || tm.CustomerId == contract.CustomerId)?.FullName
                ?? contract.TenantMembers.FirstOrDefault()?.FullName
                ?? "";

            result.Add(new RoomStatusDto
            {
                Id = room.RoomId,
                ContractId = contract.ContractId,
                Name = room.RoomName,
                Building = room.Branch?.BranchName ?? room.BranchId,
                Condition = MapCondition(room.Status),
                AvailableBedsCount = room.Beds.Count(b => b.Status.Trim().ToLower() == "trong"),
                CustomerName = tenantName,
            });
        }

        // 4. Lọc thêm theo Condition nếu FE truyền lên
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