// using Backend.Data;
// using Backend.Dtos;
// using Backend.Models;
// using Microsoft.EntityFrameworkCore;

// namespace Backend.Services;

// public class RoomInspectionConditionService : IRoomInspectionConditionService
// {
//     private readonly AppDbContext _db;

//     public RoomInspectionConditionService(AppDbContext db)
//     {
//         _db = db;
//     }

//     public async Task<List<RoomInspectionConditionDto>> GetRoomInspectionConditionsAsync()
//     {
//         var rooms = await _db.Rooms
//             .Include(r => r.Branch)
//             .Include(r => r.Beds)
//             .Include(r => r.RentalContracts)
//                 .ThenInclude(c => c.Customer)
//             .ToListAsync();

//         return rooms.Select(r => new RoomInspectionConditionDto
//         {
//             RoomId = r.RoomId,
//             RoomName = r.RoomName,
//             Building = r.Branch.BranchName,
//             Status = MapStatus(r.Status),

//             Tenant = r.RentalContracts
//                 .Where(c => c.Status == "hieu_luc")
//                 .Select(c => c.Customer.FullName)
//                 .FirstOrDefault()
//         }).ToList();
//     }
    
//     private static string MapStatus(string? status)
//     {
//         if (string.IsNullOrWhiteSpace(status))
//             return "Không xác định";

//         return status.Trim().ToLower() switch
//         {
//             RoomBedStatus.Empty => "Cần kiểm tra",
//             RoomBedStatus.Deposited => "Đã đặt cọc",
//             RoomBedStatus.Rented => "Đang thuê",
//             RoomBedStatus.Maintenance => "Cần bảo trì",
//             _ => "Không xác định"
//         };
//     }
// }