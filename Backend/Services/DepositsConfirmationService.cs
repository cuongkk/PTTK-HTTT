// Backend/Services/DepositConfirmationService.cs
using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class DepositConfirmationService : IDepositConfirmationService
{
    private readonly AppDbContext _db;

    public DepositConfirmationService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<DepositConfirmationDto>> GetDepositConfirmationsAsync()
    {
        var deposits = await _db.DepositSlips
            .Include(d => d.Application)
                .ThenInclude(a => a.Customer)
            .Include(d => d.Application)
                .ThenInclude(a => a.DesiredRoom)
                    .ThenInclude(r => r.Branch)
            .Include(d => d.Application)
                .ThenInclude(a => a.RoomViewingSchedules)
                    .ThenInclude(s => s.Rooms)
            .Include(d => d.Contract)
                .ThenInclude(c => c.Room)
                    .ThenInclude(r => r.Branch)
            .Include(d => d.SalesEmployee)
            .Include(d => d.ManagerEmployee)
            .Include(d => d.Beds)
            .ToListAsync();

        var allBedIds = deposits
            .SelectMany(d => d.Beds)
            .Select(b => b.BedId)
            .Distinct()
            .ToList();

        var beds = await _db.Beds
            .Include(b => b.Room)
                .ThenInclude(r => r.Branch)
            .Where(b => allBedIds.Contains(b.BedId))
            .ToListAsync();

        var bedLookup = beds.ToDictionary(b => b.BedId, b => b);
        var result = new List<DepositConfirmationDto>();

        foreach (var d in deposits)
        {
            var relatedBeds = d.Beds
                .Select(db => bedLookup.GetValueOrDefault(db.BedId))
                .Where(b => b != null)
                .Select(b => b!)
                .ToList();

            Room? room = relatedBeds.FirstOrDefault()?.Room
                ?? d.Contract?.Room
                ?? d.Application?.DesiredRoom;

            if (room is null)
            {
                var roomId = d.Application?.RoomViewingSchedules
                    .SelectMany(s => s.Rooms)
                    .Select(r => r.RoomId)
                    .FirstOrDefault();

                room = roomId is null
                    ? null
                    : await _db.Rooms
                        .Include(r => r.Branch)
                        .FirstOrDefaultAsync(r => r.RoomId == roomId);
            }

            var branch = room?.Branch?.BranchName ?? "";
            var bedText = relatedBeds.Any()
                ? string.Join(", ", relatedBeds.Select(b => $"Giường {b.BedNumber}"))
                : room is null
                    ? ""
                    : await _db.Beds
                        .Where(b => b.RoomId == room.RoomId)
                        .OrderBy(b => b.BedNumber)
                        .Select(b => $"Giường {b.BedNumber}")
                        .FirstOrDefaultAsync() ?? "";

            result.Add(new DepositConfirmationDto
            {
                Id = d.DepositId,
                DepositCode = d.DepositId,
                Customer = d.Application?.Customer?.FullName ?? "",
                RoomId = room?.RoomId ?? "",
                Room = room?.RoomName ?? "",
                Bed = bedText,
                Branch = branch,
                DepositAmount = d.DepositAmount.ToString("N0"),
                Status = MapStatus(d.Status),
                IsValid = d.Status == "hoan_thanh",
                ConfirmedBy = d.ManagerEmployee?.FullName ?? "",
                ConfirmedAt = d.PaidAt?.ToString("dd/MM/yyyy HH:mm") ?? "",
                ExpectedCheckIn = d.Application?.ExpectedMoveInDate?.ToString("dd/MM/yyyy") ?? "",
                Date = d.CreatedAt.ToString("dd/MM/yyyy HH:mm")
            });
        }

        return result;
    }

    private static string MapStatus(string status) => status switch
    {
        "cho_thanh_toan" => "Chờ thanh toán",
        "hoan_thanh" => "Đã xác nhận",
        "het_han" => "Hết hạn",
        "huy" => "Đã hủy",
        "cho_tiep_nhan_hoan_coc" => "Đang xử lý hoàn cọc",
        "dang_xac_nhan_hoan_coc" => "Đang xác nhận hoàn cọc",
        "cho_doi_soat_hoan_coc" => "Chờ đối soát hoàn cọc",
        "cho_khach_xac_nhan_hoan_coc" => "Chờ khách xác nhận",
        "cho_hoan_tien" => "Chờ hoàn tiền",
        "da_hoan_coc" => "Đã hoàn cọc",
        _ => "Đang xử lý"
    };

    public async Task<string> ReviewDepositAsync(string depositId, bool isApproved)
    {
        var deposit = await _db.DepositSlips
            .Include(d => d.Application)
                .ThenInclude(a => a.DesiredRoom)
            .Include(d => d.Contract)
                .ThenInclude(c => c.Room)
            .Include(d => d.Beds)
            .FirstOrDefaultAsync(d => d.DepositId == depositId);

        if (deposit is null)
            throw new KeyNotFoundException("Không tìm thấy phiếu đặt cọc.");

        // 1. Ưu tiên lấy room từ bed liên kết trực tiếp
        Room? room = null;
        var bedId = deposit.Beds.FirstOrDefault()?.BedId;
        if (bedId is not null)
        {
            var bed = await _db.Beds.FirstOrDefaultAsync(b => b.BedId == bedId);
            if (bed is not null)
                room = await _db.Rooms.FirstOrDefaultAsync(r => r.RoomId == bed.RoomId);
        }

        // 2. Fallback: lấy từ Contract
        room ??= deposit.Contract?.Room;

        // 3. Fallback: lấy từ Application.DesiredRoom
        room ??= deposit.Application?.DesiredRoom;

        if (room is null)
            throw new InvalidOperationException("Không xác định được phòng cho phiếu cọc này.");

        room.Status = isApproved
            ? "du_dieu_kien_nhan_phong"
            : "khong_du_dieu_kien_nhan_phong";

        await _db.SaveChangesAsync();

        return room.Status;
    }
}