using Backend.Dtos;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Services;


public class RoomInpectionConditionService : IRoomInpectionConditionService  
{
    private readonly AppDbContext _db;

    public RoomInpectionConditionService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<RoomConditionDto>> GetRoomConditionsAsync()
    {
        // LỌC TRỰC TIẾP TỪ DATABASE: Phòng Đang thuê + Hợp đồng Chờ kiểm tra phòng + Yêu cầu trả phòng Chờ kiểm tra
        var query = from r in _db.Rooms.Include(r => r.Branch)
                    // 1. Điều kiện Phòng: dang_thue
                    where r.Status == RoomBedStatus.Rented 

                    // 2. Join với Hợp đồng thỏa mãn: có phòng và trạng thái là cho_kiem_tra_phong
                    join c in _db.RentalContracts.Include(c => c.Customer).Include(c => c.TenantMembers)
                    on r.RoomId equals c.RoomId
                    where c.Status == "cho_kiem_tra_phong" // Đổi thành Enum nếu c.Status là Enum

                    // 3. Join với Yêu cầu trả phòng thỏa mãn: trạng thái là cho_kiem_tra
                    join cr in _db.CheckoutRequests
                    on c.ContractId equals cr.ContractId
                    where cr.Status == "cho_kiem_tra"

                    select new { Room = r, Contract = c };

        // Lấy dữ liệu đã lọc về RAM
        var filteredResults = await query.ToListAsync();

        // Lấy danh sách ID phòng đã lọc để đi query thông tin lịch hẹn (nếu cần giống logic cũ)
        var roomIds = filteredResults.Select(x => x.Room.RoomId).ToList();

        var roomCustomerLinks = await (
            from a in _db.RentalApplications
            join c in _db.Customers on a.CustomerId equals c.CustomerId
            join s in _db.RoomViewingSchedules on a.ApplicationId equals s.ApplicationId
            join sr in _db.RoomViewingScheduleRooms on s.ScheduleId equals sr.ScheduleId
            where roomIds.Contains(sr.RoomId) // Chỉ lấy các phòng nằm trong danh sách đã lọc
            select new { sr.RoomId, CustomerName = c.FullName, AppointmentAt = s.AppointmentAt }
        ).ToListAsync();

        var applicationCustomerByRoomId = roomCustomerLinks
            .GroupBy(x => x.RoomId)
            .Select(g => g.OrderByDescending(x => x.AppointmentAt).First())
            .ToDictionary(x => x.RoomId, x => x.CustomerName);

        // Map kết quả ra DTO
        return filteredResults.Select(x =>
        {
            var r = x.Room;
            var contractForRoom = x.Contract;

            // Lấy tên người thuê
            var tenantName = contractForRoom?.Customer?.FullName
                ?? contractForRoom?.TenantMembers.FirstOrDefault(tm => tm.IsPrimaryTenant || tm.CustomerId == contractForRoom.CustomerId)?.FullName
                ?? contractForRoom?.TenantMembers.FirstOrDefault()?.FullName
                ?? applicationCustomerByRoomId.GetValueOrDefault(r.RoomId)
                ?? "";

            return new RoomConditionDto
            {
                RoomID = r.RoomId,
                RoomName = r.RoomName,
                Building = r.Branch?.BranchName ?? r.BranchId,
                Status = "cho_kiem_tra_phong", // Điền thẳng trạng thái mong muốn vì đã qua bộ lọc chuẩn
                Tenant = tenantName,
                ContractId = contractForRoom?.ContractId
            };
        }).ToList();
    }

    private static string MapStatus(string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
            return "Không xác định";

        return status.Trim().ToLower() switch
        {
            RoomBedStatus.Empty => "Trống",
            RoomBedStatus.Deposited => "Đã được đặt cọc",
            RoomBedStatus.Rented => "Đang thuê",
            _ => "Không xác định"
        };
    }


}