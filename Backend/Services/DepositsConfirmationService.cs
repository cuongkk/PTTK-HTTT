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

        return deposits.Select(d =>
        {
            var relatedBeds = d.Beds
                .Select(db => bedLookup.GetValueOrDefault(db.BedId))
                .Where(b => b != null)
                .Select(b => b!)
                .ToList();

            var room = relatedBeds.FirstOrDefault()?.Room;

            return new DepositConfirmationDto
            {
                Id = d.DepositId,
                DepositCode = d.DepositId,
                Customer = d.Application?.Customer?.FullName ?? "",
                Room = room?.RoomName ?? "",
                Bed = string.Join(", ", relatedBeds.Select(b => $"Giường {b.BedNumber}")),
                Branch = room?.Branch?.BranchName ?? "",
                DepositAmount = d.DepositAmount.ToString("N0"),
                Status = MapStatus(d.Status),
                IsValid = d.Status == "hoan_thanh",
                ConfirmedBy = d.ManagerEmployee?.FullName ?? "",
                ConfirmedAt = d.PaidAt?.ToString("dd/MM/yyyy HH:mm") ?? "",
                ExpectedCheckIn = d.Application?.ExpectedMoveInDate?.ToString("dd/MM/yyyy") ?? "",
                Date = d.CreatedAt.ToString("dd/MM/yyyy HH:mm")
            };
        }).ToList();
    }

    private static string MapStatus(string status) => status switch
    {
        "cho_thanh_toan" => "Chờ thanh toán",
        "hoan_thanh" => "Đã xác nhận",
        "het_han" => "Hết hạn",
        "huy" => "Đã hủy",
        _ => "Không xác định"
    };
}