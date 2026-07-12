using Backend.Dtos;
using Backend.Data;
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
                .ThenInclude(a => a.RoomViewingSchedules)
            .ToListAsync();

        return deposits.Select(d => new DepositConfirmationDto
        {
            Id = int.Parse(d.DepositId), 
            ContractCode = d.DepositId,
            Customer = d.Application.Customer.FullName,
            Room = d.Application.DesiredArea ?? "N/A",
            DepositAmount = $"{d.DepositAmount:N0} VNĐ",
            Status = d.Status,
            Date = d.CreatedAt.ToString("dd/MM/yyyy")
        }).ToList();
    }
}