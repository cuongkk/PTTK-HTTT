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
        var rooms = await _db.Rooms
            .Include(r => r.Branch)
            .ToListAsync();

        var contracts = await _db.RentalContracts
            .Include(c => c.Customer)
            .Include(c => c.TenantMembers)
            .Where(c => c.RoomId != null)
            .ToListAsync();

        var contractByRoomId = contracts
            .GroupBy(c => c.RoomId)
            .Select(g => g.OrderByDescending(c => c.StartDate).First())
            .ToDictionary(c => c.RoomId, c => c);

        var roomCustomerLinks = await (
            from a in _db.RentalApplications
            join c in _db.Customers on a.CustomerId equals c.CustomerId
            join s in _db.RoomViewingSchedules on a.ApplicationId equals s.ApplicationId
            join sr in _db.RoomViewingScheduleRooms on s.ScheduleId equals sr.ScheduleId
            select new { sr.RoomId, CustomerName = c.FullName, AppointmentAt = s.AppointmentAt }
        ).ToListAsync();

        var applicationCustomerByRoomId = roomCustomerLinks
            .GroupBy(x => x.RoomId)
            .Select(g => g.OrderByDescending(x => x.AppointmentAt).First())
            .ToDictionary(x => x.RoomId, x => x.CustomerName);

        return rooms.Select(r =>
        {
            var contractForRoom = contractByRoomId.GetValueOrDefault(r.RoomId);
            var tenantName = string.Empty;

            if (r.Status == RoomBedStatus.Rented || r.Status == RoomBedStatus.Deposited)
            {
                tenantName = contractForRoom?.Customer?.FullName
                    ?? contractForRoom?.TenantMembers.FirstOrDefault(tm => tm.IsPrimaryTenant || tm.CustomerId == contractForRoom.CustomerId)?.FullName
                    ?? contractForRoom?.TenantMembers.FirstOrDefault()?.FullName
                    ?? applicationCustomerByRoomId.GetValueOrDefault(r.RoomId)
                    ?? "";
            }

            return new RoomConditionDto
            {
                RoomID = r.RoomId,
                RoomName = r.RoomName,
                Building = r.Branch?.BranchName ?? r.BranchId,
                Status = MapStatus(r.Status),
                Tenant = tenantName
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

    // public async Task<RoomInspectionResultDto> CreateRoomInspectionAsync(
    //     CreateRoomInspectionDto dto,
    //     string inspectedByEmployeeId)
    // {
    //     var roomExists = await _db.Rooms.AnyAsync(r => r.RoomId == dto.RoomId);
    //     if (!roomExists)
    //         throw new KeyNotFoundException("Không tìm thấy phòng.");

    //     var inspection = new RoomInspection
    //     {
    //         RoomId = dto.RoomId,
    //         InspectedByEmployeeId = inspectedByEmployeeId,
    //         OverallCondition = dto.OverallCondition,
    //         Cleanliness = dto.Cleanliness,
    //         DamageNotes = dto.DamageNotes,
    //         EstimatedCost = dto.EstimatedCost,
    //         NeedMaintenance = dto.NeedMaintenance,
    //         InspectedAt = DateTime.UtcNow
    //     };

    //     _db.RoomInspections.Add(inspection);
    //     await _db.SaveChangesAsync();

    //     return new RoomInspectionResultDto
    //     {
    //         InspectionId = inspection.Id,
    //         RoomId = inspection.RoomId,
    //         InspectedAt = inspection.InspectedAt
    //     };
    // }



}