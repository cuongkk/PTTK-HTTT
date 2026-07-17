using Backend.Common;
using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Backend.Utilities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IManagerHandoverService
{
    Task<List<ManagerHandoverContractDto>> GetPendingAsync();
    Task<string> CreateAsync(CreateManagerHandoverDto dto, string accountId);
}

public class ManagerHandoverService(AppDbContext db) : IManagerHandoverService
{
    public async Task<List<ManagerHandoverContractDto>> GetPendingAsync()
    {
        var contracts = await db.RentalContracts
            .Include(x => x.Room)
            .Include(x => x.Customer)
            .Where(x => x.Status == "cho_xac_nhan_ban_giao" && !db.HandoverReports.Any(r => r.ContractId == x.ContractId))
            .OrderBy(x => x.StartDate)
            .ToListAsync();

        var result = new List<ManagerHandoverContractDto>();
        foreach (var contract in contracts)
        {
            var assets = await db.Assets.Where(x => x.RoomId == contract.RoomId).OrderBy(x => x.AssetName)
                .Select(x => new ManagerHandoverAssetDto(x.AssetId, x.AssetName, 1, x.Condition, null)).ToListAsync();
            result.Add(new ManagerHandoverContractDto(contract.ContractId, contract.RoomId, contract.Room.RoomName, contract.Customer.FullName, contract.StartDate, assets));
        }
        return result;
    }

    public async Task<string> CreateAsync(CreateManagerHandoverDto dto, string accountId)
    {
        if (string.IsNullOrWhiteSpace(dto.RoomCondition)) throw new ValidationException("Vui lòng ghi hiện trạng phòng.");
        var managerId = await db.Accounts.Where(x => x.AccountId == accountId).Select(x => x.EmployeeId).FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Không xác định được nhân viên Quản lý.");
        var contract = await db.RentalContracts.Include(x => x.Room).FirstOrDefaultAsync(x => x.ContractId == dto.ContractId)
            ?? throw new NotFoundException("Không tìm thấy hợp đồng.");
        if (contract.Status != "cho_xac_nhan_ban_giao") throw new ConflictException("Hợp đồng không ở bước chờ lập biên bản bàn giao.");
        if (await db.HandoverReports.AnyAsync(x => x.ContractId == contract.ContractId)) throw new ConflictException("Hợp đồng đã có biên bản bàn giao.");

        var assetIds = await db.Assets.Where(x => x.RoomId == contract.RoomId).Select(x => x.AssetId).ToListAsync();
        if (dto.Assets.Any(x => !assetIds.Contains(x.AssetId))) throw new ValidationException("Có tài sản không thuộc phòng này.");

        var handoverId = IdGenerator.Generate("BB", 12);
        db.HandoverReports.Add(new HandoverReport
        {
            HandoverId = handoverId, ContractId = contract.ContractId, ManagerEmployeeId = managerId,
            HandoverDate = DateOnly.FromDateTime(DateTime.Today), RoomCondition = dto.RoomCondition.Trim(),
            InitialElectricityReading = dto.InitialElectricityReading, InitialWaterReading = dto.InitialWaterReading,
            Note = dto.Note?.Trim()
        });
        foreach (var asset in dto.Assets)
            db.HandoverDetails.Add(new HandoverDetail { HandoverId = handoverId, AssetId = asset.AssetId, Quantity = asset.Quantity, Condition = asset.Condition, Note = asset.Note });

        var customerAccount = await db.Accounts.FirstOrDefaultAsync(x => x.CustomerId == contract.CustomerId);
        if (customerAccount != null)
            db.Notifications.Add(new Notification { NotificationId = IdGenerator.Generate("TB", 12), RecipientAccountId = customerAccount.AccountId, Title = "Biên bản bàn giao chờ xác nhận", Content = $"Quản lý đã lập biên bản bàn giao cho {contract.Room.RoomName}. Vui lòng xem và xác nhận.", NotificationType = $"handover|{contract.RoomId}", CreatedAt = DateTime.UtcNow });

        await db.SaveChangesAsync();
        return handoverId;
    }
}
