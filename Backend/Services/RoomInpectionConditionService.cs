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
        // 1. Lấy toàn bộ danh sách phòng trước
        var rooms = await _db.Rooms
            .Include(r => r.Branch)
            .Where(r => r.Status == RoomBedStatus.Rented)
            .ToListAsync();

        // 2. Lấy danh sách hợp đồng đang hiệu lực từ bảng RentalContracts kèm thông tin Khách hàng
        var activeContracts = await _db.RentalContracts
            .Include(c => c.Customer)
            .Where(c => c.Status == "hieu_luc")
            .ToListAsync();

        // 3. Map sang DTO bằng cách tìm hợp đồng tương ứng với từng phòng
        return rooms.Select(r => 
        {
            // Tìm hợp đồng hiệu lực của phòng này (nếu có)
            var contractForRoom = activeContracts.FirstOrDefault(c => c.RoomId == r.RoomId);

            return new RoomConditionDto
            {
                RoomID = r.RoomId, 
                RoomName = r.RoomName,
                Building = r.Branch.BranchName,
                Status = MapStatus(r.Status),
                // Nếu tìm thấy hợp đồng thì lấy tên khách hàng, không thì để rỗng
                Tenant = contractForRoom?.Customer?.FullName ?? "" 
            };
        }).ToList();
    }

    private static string MapStatus(string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
            return "Không xác định";

        return status.Trim().ToLower() switch
        {
            RoomBedStatus.Empty => "Available",
            RoomBedStatus.Deposited => "Deposited",
            RoomBedStatus.Rented => "Rented",
            _ => "Không xác định"
        };
    }
}