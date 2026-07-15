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
            .Include(c => c.Customer)
            .Include(c => c.TenantMembers)
            .Include(c => c.Deposit)
                .ThenInclude(d => d.Application)
                    .ThenInclude(a => a.TenantMembers)
            .Where(c => c.Room != null 
                        && c.Room.Status == "da_dat_coc" 
                        && c.Status == "cho_quan_ly_duyet_nhan_phong")
            .ToListAsync();

        var customerIds = contracts
            .SelectMany(c => c.TenantMembers.Select(tm => tm.CustomerId))
            .Where(id => !string.IsNullOrEmpty(id))
            .Concat(contracts.Where(c => !string.IsNullOrEmpty(c.CustomerId)).Select(c => c.CustomerId!))
            .Distinct()
            .ToList();

        var customers = await _db.Customers
            .Where(cu => customerIds.Contains(cu.CustomerId))
            .ToDictionaryAsync(cu => cu.CustomerId);

        return contracts.Select(c =>
        {
            var linkedMembers = c.TenantMembers
                .Where(tm => tm.ContractId == c.ContractId || tm.ContractId == null)
                .ToList();

            if (!linkedMembers.Any() && c.Deposit?.Application != null)
            {
                linkedMembers = c.Deposit.Application.TenantMembers
                    .Where(tm => tm.ContractId == null || tm.ContractId == c.ContractId)
                    .ToList();
            }

            var tenants = new List<TenantDto>();

            if (c.Customer != null)
            {
                var representativeMember = linkedMembers.FirstOrDefault(tm => tm.CustomerId == c.CustomerId || tm.IsPrimaryTenant);
                tenants.Add(new TenantDto
                {
                    Name = c.Customer.FullName,
                    IdNumber = representativeMember?.NationalId,
                    Phone = c.Customer.PhoneNumber,
                    CustomerId = c.CustomerId,
                    CustomerName = c.Customer.FullName,
                    IsPrimaryTenant = true,
                    IsEligible = representativeMember?.IsEligible ?? true,
                });
            }

            tenants.AddRange(linkedMembers
                .Where(tm => !(c.Customer != null && tm.CustomerId == c.CustomerId))
                .Select(tm => new TenantDto
                {
                    Name = tm.FullName,
                    IdNumber = tm.NationalId,
                    Phone = (tm.CustomerId != null && customers.ContainsKey(tm.CustomerId)) ? customers[tm.CustomerId].PhoneNumber : null,
                    CustomerId = tm.CustomerId,
                    CustomerName = (tm.CustomerId != null && customers.ContainsKey(tm.CustomerId)) ? customers[tm.CustomerId].FullName : null,
                    IsPrimaryTenant = tm.IsPrimaryTenant,
                    IsEligible = tm.IsEligible,
                }));

            return new TenantVerificationDto
            {
                Id = c.ContractId,
                ContractCode = c.ContractId,
                CustomerId = c.CustomerId,
                CustomerName = c.Customer?.FullName ?? null,
                Room = c.Room?.RoomName ?? "",
                Building = c.Room?.Branch?.BranchName ?? "",
                CheckInDate = c.StartDate.ToString("dd/MM/yyyy"),
                CheckOutDate = c.EndDate?.ToString("dd/MM/yyyy") ?? "",
                Tenants = tenants,
                ApplicationId = c.Deposit?.Application?.ApplicationId,
            };
        }).ToList();
    }

    public async Task<string> ReviewTenantVerificationAsync(string contractId, bool isApproved)
    {
        var contract = await _db.RentalContracts
            .Include(c => c.Deposit)
                .ThenInclude(d => d.Application)
            .FirstOrDefaultAsync(c => c.ContractId == contractId);

        if (contract is null)
            throw new KeyNotFoundException("Không tìm thấy hợp đồng.");

        var application = contract.Deposit?.Application;
        if (application is null)
            throw new InvalidOperationException("Không xác định được hồ sơ đăng ký cho hợp đồng này.");

        application.Status = isApproved
            ? "du_dieu_kien_nhan_phong"
            : "khong_du_dieu_kien_nhan_phong";

        await _db.SaveChangesAsync();

        return application.Status;
    }
}