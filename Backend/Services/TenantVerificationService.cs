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
        var contracts = await _db.RentalContracts
            .Include(c => c.Room)
                .ThenInclude(r => r.Branch)
            .Include(c => c.TenantMembers)
            .ToListAsync();

        // Load customers referenced by tenant members to access phone numbers
        var customerIds = contracts
            .SelectMany(c => c.TenantMembers.Select(tm => tm.CustomerId))
            .Where(id => !string.IsNullOrEmpty(id))
            .Distinct()
            .ToList();

        var customers = await _db.Customers
            .Where(cu => customerIds.Contains(cu.CustomerId))
            .ToDictionaryAsync(cu => cu.CustomerId);

        return contracts.Select(c => new TenantVerificationDto
        {
            Id = c.ContractId,
            ContractCode = c.ContractId,
            Room = c.Room?.RoomName ?? "",
            Building = c.Room?.Branch?.BranchName ?? "",
            CheckInDate = c.StartDate.ToString("dd/MM/yyyy"),
            CheckOutDate = c.EndDate?.ToString("dd/MM/yyyy") ?? "",
            Tenants = c.TenantMembers.Select(tm => new TenantDto
            {
                Name = tm.FullName,
                IdNumber = tm.NationalId,
                Phone = (tm.CustomerId != null && customers.ContainsKey(tm.CustomerId)) ? customers[tm.CustomerId].PhoneNumber : null,
            }).ToList()
        }).ToList();
    }
}