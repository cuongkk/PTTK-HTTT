using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class CheckoutReportService : ICheckoutReportService
{
    private readonly AppDbContext _db;

    public CheckoutReportService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CheckoutReportResultDto> CreateCheckoutReportAsync(
        CreateCheckoutReportDto dto,
        string managerEmployeeId)
    {
        var contractExists = await _db.RentalContracts.AnyAsync(c => c.ContractId == dto.ContractId);
        if (!contractExists)
            throw new KeyNotFoundException("Không tìm thấy hợp đồng.");

        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            // 1. Tạo Reconciliation placeholder để lấy khóa ngoại
            var reconciliation = new Reconciliation
            {
                ReconciliationId = Guid.NewGuid().ToString(), // TODO: đổi sang cách sinh mã của bạn nếu có
                ContractId = dto.ContractId,
                AccountantEmployeeId = managerEmployeeId, // tạm để manager, kế toán sẽ cập nhật lại sau
                ManagerEmployeeId = managerEmployeeId,
                CreatedDate = DateOnly.FromDateTime(DateTime.Now),
                RefundRate = 0,
                OriginalDeposit = 0,
                BaseRefund = 0,
                TotalDeductions = 0,
                RefundAmount = null,
                AdditionalPaymentAmount = null,
                Status = "cho_xac_nhan"
            };
            _db.Reconciliations.Add(reconciliation);

            // 2. Tạo CheckoutReport gắn với Reconciliation vừa tạo
            var checkoutReport = new CheckoutReport
            {
                CheckoutReportId = Guid.NewGuid().ToString(), // TODO: đổi sang cách sinh mã của bạn nếu có
                ReconciliationId = reconciliation.ReconciliationId,
                ManagerEmployeeId = managerEmployeeId,
                CheckoutDate = DateOnly.FromDateTime(DateTime.Now),
                RoomCondition = dto.RoomCondition,
                FinalElectricityReading = null,
                FinalWaterReading = null,
                KeysReturned = true,
                Note = dto.Note
            };
            _db.CheckoutReports.Add(checkoutReport);

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return new CheckoutReportResultDto
            {
                CheckoutReportId = checkoutReport.CheckoutReportId,
                ReconciliationId = reconciliation.ReconciliationId,
                CheckoutDate = checkoutReport.CheckoutDate
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}