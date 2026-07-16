// Backend/Services/TenantVerificationService.cs
using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class TenantVerificationService : ITenantVerificationService
{
    private readonly AppDbContext _db;

    public TenantVerificationService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<TenantVerificationDto>> GetTenantVerificationsAsync()
    {
        // 1. Lấy hồ sơ đang chờ quản lý duyệt nhận phòng, kèm khách hàng, thành viên, phiếu cọc, lịch xem phòng
        var applications = await _db.RentalApplications
            .Include(a => a.Customer)
            .Include(a => a.TenantMembers)
            .Include(a => a.DepositSlips)
            .Include(a => a.RoomViewingSchedules)
                .ThenInclude(s => s.Rooms)
            .Where(a => a.Status == "cho_quan_ly_duyet_nhan_phong"
                    && a.DepositSlips.Any())
            .ToListAsync();

        // 2. Gom RoomId cần nạp thêm (Branch...)
        var roomIds = applications
            .SelectMany(a => a.RoomViewingSchedules.SelectMany(s => s.Rooms.Select(r => r.RoomId)))
            .Distinct()
            .ToList();

        var rooms = await _db.Rooms
            .Include(r => r.Branch)
            .Where(r => roomIds.Contains(r.RoomId))
            .ToListAsync();

        var roomLookup = rooms.ToDictionary(r => r.RoomId, r => r);

        // 3. Gom customerId cần nạp thêm (từ thành viên thuê)
        var customerIds = applications
            .SelectMany(a => a.TenantMembers.Select(tm => tm.CustomerId))
            .Concat(applications.Select(a => a.CustomerId))
            .Where(id => !string.IsNullOrEmpty(id))
            .Distinct()
            .ToList();

        var customersDict = await _db.Customers
            .Where(cu => customerIds.Contains(cu.CustomerId))
            .ToDictionaryAsync(cu => cu.CustomerId);

        // 4. Build DTO
        var result = new List<TenantVerificationDto>();

        foreach (var app in applications)
        {
            var roomId = app.RoomViewingSchedules
                .SelectMany(s => s.Rooms)
                .Select(r => r.RoomId)
                .FirstOrDefault();

            var room = roomId is null ? null : roomLookup.GetValueOrDefault(roomId);
            if (room is null)
                continue;

            var groupMembers = app.TenantMembers.ToList();
            var tenantsInGroup = new List<TenantDto>();

            if (app.Customer != null)
            {
                var primaryMemberInfo = groupMembers.FirstOrDefault(tm => tm.CustomerId == app.CustomerId || tm.IsPrimaryTenant);
                tenantsInGroup.Add(new TenantDto
                {
                    CustomerId = app.CustomerId,
                    Name = app.Customer.FullName,
                    Phone = app.Customer.PhoneNumber,
                    IdNumber = primaryMemberInfo?.NationalId,
                    IsPrimaryTenant = true,
                    IsEligible = primaryMemberInfo?.IsEligible ?? true
                });
            }

            tenantsInGroup.AddRange(groupMembers
                .Where(tm => tm.CustomerId != app.CustomerId)
                .Select(tm => new TenantDto
                {
                    CustomerId = tm.CustomerId,
                    Name = tm.FullName,
                    IdNumber = tm.NationalId,
                    Phone = (tm.CustomerId != null && customersDict.TryGetValue(tm.CustomerId, out var cust)) ? cust.PhoneNumber : null,
                    IsPrimaryTenant = false,
                    IsEligible = tm.IsEligible
                }));

            result.Add(new TenantVerificationDto
            {
                Id = app.ApplicationId,
                ContractCode = "",
                CustomerId = app.CustomerId,
                CustomerName = app.Customer?.FullName,
                Room = room.RoomName,
                Building = room.Branch?.BranchName ?? "",
                CheckInDate = app.ExpectedMoveInDate?.ToString("dd/MM/yyyy") ?? "",
                CheckOutDate = "",
                Tenants = tenantsInGroup,
                ApplicationId = app.ApplicationId
            });
        }

        return result;
    }

    public async Task<string> ReviewTenantVerificationAsync(string applicationId, bool isApproved)
    {
        var application = await _db.RentalApplications
            .FirstOrDefaultAsync(a => a.ApplicationId == applicationId);

        if (application is null)
            throw new KeyNotFoundException("Không tìm thấy hồ sơ đăng ký.");

        application.Status = isApproved
            ? "du_dieu_kien_nhan_phong"
            : "khong_du_dieu_kien_nhan_phong";

        await _db.SaveChangesAsync();

        return application.Status;
    }
}